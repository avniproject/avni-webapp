package org.avni.service;


import org.avni.application.Form;
import org.avni.application.KeyType;
import org.avni.dao.IdentifierAssignmentRepository;
import org.avni.dao.IdentifierSourceRepository;
import org.avni.domain.IdentifierAssignment;
import org.avni.domain.IdentifierSource;
import org.avni.domain.User;
import org.avni.identifier.IdentifierGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IdentifierAssignmentService {

    private IdentifierSourceRepository identifierSourceRepository;

    private IdentifierAssignmentRepository identifierAssignmentRepository;

    private ApplicationContext context;

    @Autowired
    public IdentifierAssignmentService(IdentifierSourceRepository identifierSourceRepository, IdentifierAssignmentRepository identifierAssignmentRepository, ApplicationContext context) {
        this.identifierSourceRepository = identifierSourceRepository;
        this.identifierAssignmentRepository = identifierAssignmentRepository;
        this.context = context;
    }


    @Transactional
    public void generateIdentifiersIfNecessary(User user) {
        List<IdentifierSource> allAuthorisedIdentifierSources = identifierSourceRepository.getAllAuthorisedIdentifierSources(user.getCatchment(), user.getFacility());
        for (IdentifierSource identifierSource : allAuthorisedIdentifierSources) {
            generateIdentifiersIfNecessary(user, identifierSource);
        }
    }

    @Transactional
    public void generateIdentifiersIfNecessary(User user, IdentifierSource identifierSource) {
        if (shouldGenerateIdentifiers(user, identifierSource)) {
            IdentifierGenerator identifierGenerator = context.getBean(identifierSource.getType(), IdentifierGenerator.class);
            identifierGenerator.generateIdentifiers(identifierSource, user);
        }
    }

    @Transactional
    public List<IdentifierAssignment> generateIdentifiersForAForm(Form form, User user) {
        return form.getAllFormElements().stream()
                .filter(formElement -> formElement.getKeyValues().containsKey(KeyType.IdSourceUUID))
                .map(formElement -> {
                    String idSourceUuid = (String) formElement.getKeyValues().getKeyValue(KeyType.IdSourceUUID).getValue();
                    IdentifierSource identifierSource = identifierSourceRepository.findByUuid(idSourceUuid);
                    IdentifierGenerator identifierGenerator = context.getBean(identifierSource.getType(), IdentifierGenerator.class);
                    return identifierGenerator.generateSingleIdentifier(identifierSource, user);
                }).collect(Collectors.toList());
    }

    private boolean shouldGenerateIdentifiers(User user, IdentifierSource identifierSource) {
        Integer spareIdentifierAssignments = identifierAssignmentRepository.countIdentifierAssignmentByIdentifierSourceEqualsAndAndAssignedToEqualsAndIndividualIsNullAndProgramEnrolmentIsNull(identifierSource, user);
        return spareIdentifierAssignments < identifierSource.getMinimumBalance();
    }
}
