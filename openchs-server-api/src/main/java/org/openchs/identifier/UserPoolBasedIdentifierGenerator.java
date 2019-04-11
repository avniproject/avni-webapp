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


@Service
@Qualifier("userPoolBasedIdentifierGenerator")
public class UserPoolBasedIdentifierGenerator implements IdentifierGenerator {

    public static final String PREFIX = "prefix";
    private IdentifierAssignmentRepository identifierAssignmentRepository;
    private IdentifierUserAssignmentRepository identifierUserAssignmentRepository;


    @Autowired
    public UserPoolBasedIdentifierGenerator(IdentifierAssignmentRepository identifierAssignmentRepository, IdentifierUserAssignmentRepository identifierUserAssignmentRepository) {
        this.identifierAssignmentRepository = identifierAssignmentRepository;
        this.identifierUserAssignmentRepository = identifierUserAssignmentRepository;
    }

    @Override
    @Transactional
    public void generateIdentifiers(IdentifierSource identifierSource, User user) {
        List<IdentifierUserAssignment> identifierUserAssignments = identifierUserAssignmentRepository.getAllNonExhaustedUserAssignments(user, identifierSource);
        Long batchGenerationSize = identifierSource.getBatchGenerationSize();
        NextIdentifierUserAssignment nextIdentifierUserAssignment = new NextIdentifierUserAssignment(identifierUserAssignments, batchGenerationSize);
        List<IdentifierAssignment> generatedIdentifiers = new ArrayList<>();

        while(nextIdentifierUserAssignment.hasNext()) {
            IdentifierUserAssignment identifierUserAssignment = nextIdentifierUserAssignment.next();
            generatedIdentifiers.add(assignNextIdentifier(identifierUserAssignment));
        }

        identifierUserAssignmentRepository.save(identifierUserAssignments);
        identifierAssignmentRepository.save(generatedIdentifiers);
    }

    private IdentifierAssignment assignNextIdentifier(IdentifierUserAssignment identifierUserAssignment) {
        String lastAssignedIdentifier = identifierUserAssignment.getLastAssignedIdentifier();
        IdentifierSource identifierSource = identifierUserAssignment.getIdentifierSource();
        String prefix = (String) identifierSource.getOptions().get(PREFIX);
        long newIdentifierOrder; String newIdentifierStr;

        if (lastAssignedIdentifier != null) {
            String lastIdentifierStr = lastAssignedIdentifier.replaceFirst(prefix, "");
            long lastIdentifier = Long.parseLong(lastIdentifierStr);
            newIdentifierOrder = lastIdentifier + 1;
            newIdentifierStr = prefix + Long.toString(newIdentifierOrder);
        } else {
            String lastIdentifierStr = identifierUserAssignment.getIdentifierStart().replaceFirst(prefix, "");
            newIdentifierOrder = Long.parseLong(lastIdentifierStr);
            newIdentifierStr = prefix + Long.toString(newIdentifierOrder);
        }

        identifierUserAssignment.setLastAssignedIdentifier(newIdentifierStr);

        IdentifierAssignment identifierAssignment = new IdentifierAssignment(identifierUserAssignment.getIdentifierSource(), newIdentifierStr, newIdentifierOrder, identifierUserAssignment.getAssignedTo());
        identifierAssignment.assignUUID();
        return identifierAssignment;
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
