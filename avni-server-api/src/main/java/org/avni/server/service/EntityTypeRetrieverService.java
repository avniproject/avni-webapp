package org.avni.server.service;

import org.avni.server.dao.*;
import org.avni.server.domain.CHSEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EntityTypeRetrieverService {
    private SubjectTypeRepository subjectTypeRepository;
    private ProgramRepository programRepository;
    private EncounterTypeRepository encounterTypeRepository;

    @Autowired
    public EntityTypeRetrieverService(SubjectTypeRepository subjectTypeRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository) {
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
    }

    public CHSEntity getEntityType(String entityType, Long entityTypeId) {
        return findRepository(entityType).findEntity(entityTypeId);
    }

    public CHSEntity getEntityType(String entityType, String entityTypeUuid) {
        return findRepository(entityType).findByUuid(entityTypeUuid);
    }

    private CHSRepository findRepository(String entityType) {
        switch (entityType) {
            case "Subject":
                return subjectTypeRepository;
            case "ProgramEnrolment":
                return programRepository;
            case "Encounter":
            case "ProgramEncounter":
                return encounterTypeRepository;
            default:
                throw new IllegalArgumentException("Unknown entityType " + entityType);
        }
    }
}
