package org.openchs.identifier;


import org.openchs.dao.IdentifierAssignmentRepository;
import org.openchs.dao.IdentifierUserAssignmentRepository;
import org.openchs.domain.IdentifierAssignment;
import org.openchs.domain.IdentifierSource;
import org.openchs.domain.IdentifierUserAssignment;
import org.openchs.domain.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;


/**
 * It is assumed here that generation of identifiers for the same user will not happen in parallel.
 * If it does happen, there are database checks that ensure that one of the transactions will fail due to
 * uniqueness constraints. One of the transactions will fail in such scenarios.
 *
 * It is also assumed that every id is pre-assigned to a single user. This is to ensure server does not need to have
 * costly locking mechanisms.
 *
 * We will need to introduce row-locking on the identifier_user_assignment table if we expect parallel calls for
 * identifier generation for the same id.
 */
@Service
public class PrefixedUserPoolBasedIdentifierGenerator {
    private static final String PADDING_STRING = "0";
    private IdentifierAssignmentRepository identifierAssignmentRepository;
    private IdentifierUserAssignmentRepository identifierUserAssignmentRepository;


    @Autowired
    public PrefixedUserPoolBasedIdentifierGenerator(IdentifierAssignmentRepository identifierAssignmentRepository, IdentifierUserAssignmentRepository identifierUserAssignmentRepository) {
        this.identifierAssignmentRepository = identifierAssignmentRepository;
        this.identifierUserAssignmentRepository = identifierUserAssignmentRepository;
    }

    @Transactional
    public void generateIdentifiers(IdentifierSource identifierSource, User user, String prefix) {
        List<IdentifierUserAssignment> identifierUserAssignments = identifierUserAssignmentRepository.getAllNonExhaustedUserAssignments(user, identifierSource);
        Long batchGenerationSize = identifierSource.getBatchGenerationSize();
        NextIdentifierUserAssignment nextIdentifierUserAssignment = new NextIdentifierUserAssignment(identifierUserAssignments, batchGenerationSize);
        List<IdentifierAssignment> generatedIdentifiers = new ArrayList<>();

        while(nextIdentifierUserAssignment.hasNext()) {
            IdentifierUserAssignment identifierUserAssignment = nextIdentifierUserAssignment.next();
            generatedIdentifiers.add(assignNextIdentifier(identifierUserAssignment, prefix));
        }

        identifierUserAssignmentRepository.saveAll(identifierUserAssignments);
        identifierAssignmentRepository.saveAll(generatedIdentifiers);
    }

    private IdentifierAssignment assignNextIdentifier(IdentifierUserAssignment identifierUserAssignment, String prefix) {
        String lastAssignedIdentifier = identifierUserAssignment.getLastAssignedIdentifier();
        IdentifierSource identifierSource = identifierUserAssignment.getIdentifierSource();
        long newIdentifierOrder; String newIdentifierStr, newIdentifierStrWithPrefix;

        if (lastAssignedIdentifier != null) {
            String lastIdentifierStr = lastAssignedIdentifier.replaceFirst(prefix, "");
            long lastIdentifier = Long.parseLong(lastIdentifierStr);
            newIdentifierOrder = lastIdentifier + 1;
        } else {
            String lastIdentifierStr = identifierUserAssignment.getIdentifierStart().replaceFirst(prefix, "");
            newIdentifierOrder = Long.parseLong(lastIdentifierStr);
        }
        newIdentifierStr = addPaddingIfNecessary(Long.toString(newIdentifierOrder), identifierSource);
        if(newIdentifierStr.length() > identifierSource.getMaxLength())
            throw new RuntimeException(String.format("Identifier %s exceeds max length %d", newIdentifierStr, identifierSource.getMaxLength()));
        newIdentifierStrWithPrefix = prefix + newIdentifierStr;

        identifierUserAssignment.setLastAssignedIdentifier(newIdentifierStrWithPrefix);

        IdentifierAssignment identifierAssignment = new IdentifierAssignment(identifierSource, newIdentifierStrWithPrefix, newIdentifierOrder, identifierUserAssignment.getAssignedTo());
        identifierAssignment.assignUUID();
        return identifierAssignment;
    }

    private String addPaddingIfNecessary(String identifier, IdentifierSource identifierSource) {
        int lengthOfIdentifier = identifier.length();
        if(lengthOfIdentifier < identifierSource.getMinLength()) {
            int paddingLength = identifierSource.getMinLength() - lengthOfIdentifier;
            String padding = new String(new char[paddingLength]).replace("\0", PADDING_STRING);
            identifier = padding + identifier;
        }
        return identifier;
    }

    class NextIdentifierUserAssignment {
        private Long batchSize;
        private final Iterator<IdentifierUserAssignment> allAssignments;
        private IdentifierUserAssignment cursor;

        NextIdentifierUserAssignment(List<IdentifierUserAssignment> identifierUserAssignments, Long initialBatchSize) {
            batchSize = initialBatchSize;
            allAssignments = identifierUserAssignments.iterator();
            cursor = next();
        }

        IdentifierUserAssignment next() {
            batchSize--;
            return updateCursor();
        }

        private IdentifierUserAssignment updateCursor() {
            if (cursor != null && !cursor.isExhausted()) {
                return cursor;
            }
            return cursor = allAssignments.hasNext() ? allAssignments.next() : null;
        }

        boolean hasNext() {
            return batchSize >= 0 && updateCursor() != null;
        }
    }
}
