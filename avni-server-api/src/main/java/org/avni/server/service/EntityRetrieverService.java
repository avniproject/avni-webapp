package org.avni.server.service;

import org.avni.server.dao.*;
import org.avni.server.domain.CHSEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EntityRetrieverService {
    private IndividualRepository individualRepository;
    private ProgramEnrolmentRepository programEnrolmentRepository;
    private ProgramEncounterRepository programEncounterRepository;
    private EncounterRepository encounterRepository;

    @Autowired
    public EntityRetrieverService(IndividualRepository individualRepository, ProgramEnrolmentRepository programEnrolmentRepository, ProgramEncounterRepository programEncounterRepository, EncounterRepository encounterRepository) {
        this.individualRepository = individualRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.encounterRepository = encounterRepository;
    }

    public CHSEntity getEntity(String entityType, Long entityId) {
        return findRepository(entityType).findEntity(entityId);
    }

    private CHSRepository findRepository(String entityType) {
        switch (entityType) {
            case "Subject":
                return individualRepository;
            case "ProgramEnrolment":
                return programEnrolmentRepository;
            case "Encounter":
                return encounterRepository;
            case "ProgramEncounter":
                return programEncounterRepository;
            default:
                throw new IllegalArgumentException("Unknown entityType " + entityType);
        }
    }
}
