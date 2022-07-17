package org.avni.service;

import org.avni.domain.*;
import org.joda.time.DateTime;
import org.avni.dao.*;
import org.avni.web.request.EntityApprovalStatusRequest;
import org.avni.web.request.rules.RulesContractWrapper.EntityApprovalStatusWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

import static org.avni.domain.EntityApprovalStatus.EntityType.*;

@Service
public class EntityApprovalStatusService implements NonScopeAwareService {

    private EntityApprovalStatusRepository entityApprovalStatusRepository;
    private ApprovalStatusRepository approvalStatusRepository;
    private Map<EntityApprovalStatus.EntityType, TransactionalDataRepository> typeMap = new HashMap<>();

    @Autowired
    public EntityApprovalStatusService(EntityApprovalStatusRepository entityApprovalStatusRepository, ApprovalStatusRepository approvalStatusRepository, IndividualRepository individualRepository, EncounterRepository encounterRepository, ChecklistItemRepository checklistItemRepository, ProgramEncounterRepository programEncounterRepository, ProgramEnrolmentRepository programEnrolmentRepository) {
        this.entityApprovalStatusRepository = entityApprovalStatusRepository;
        this.approvalStatusRepository = approvalStatusRepository;
        this.typeMap.put(Subject, individualRepository);
        this.typeMap.put(Encounter, encounterRepository);
        this.typeMap.put(ChecklistItem, checklistItemRepository);
        this.typeMap.put(ProgramEncounter, programEncounterRepository);
        this.typeMap.put(ProgramEnrolment, programEnrolmentRepository);
    }

    public EntityApprovalStatus save(EntityApprovalStatusRequest request) {
        EntityApprovalStatus.EntityType entityType = EntityApprovalStatus.EntityType.valueOf(request.getEntityType());
        EntityApprovalStatus entityApprovalStatus = createEntityApprovalStatus(request);

        entityApprovalStatus.updateAudit();
        CHSEntity entity = getChsEntityByUuid(request.getEntityUuid(), entityType);
        entityApprovalStatus.copyAttributesFromEntity((EntitySyncableByMultipleStrategies) entity);
        entityApprovalStatus.setEntityId(entity.getId());

        return entityApprovalStatusRepository.save(entityApprovalStatus);
    }

    public String getEntityUuid(EntityApprovalStatus eaStatus) {
        EntityApprovalStatus.EntityType entityType = eaStatus.getEntityType();
        if (typeMap.get(entityType) == null) {
            throw new IllegalArgumentException(String.format("Incorrect entityType '%s' found in database while fetching EntityApprovalStatus", entityType));
        }
        CHSEntity entity = typeMap.get(entityType).findOne(eaStatus.getEntityId());
        if (entity == null) {
            throw new IllegalArgumentException(String.format("Incorrect entityId '%s' found in database while fetching EntityApprovalStatus", eaStatus.getEntityId()));
        }
        return entity.getUuid();
    }

    public void createStatus(EntityApprovalStatus.EntityType entityType, CHSEntity entity, ApprovalStatus.Status status) {
        ApprovalStatus approvalStatus = approvalStatusRepository.findByStatus(status);
        EntityApprovalStatus entityApprovalStatuses = entityApprovalStatusRepository.findFirstByEntityIdAndEntityTypeAndIsVoidedFalseOrderByStatusDateTimeDesc(entity.getId(), entityType);
        if (entityApprovalStatuses != null && entityApprovalStatuses.getApprovalStatus().getStatus().equals(status)) {
            return;
        }
        EntityApprovalStatus entityApprovalStatus = new EntityApprovalStatus();
        entityApprovalStatus.assignUUID();
        entityApprovalStatus.setEntityType(entityType);
        entityApprovalStatus.setEntityId(entity.getId());
        entityApprovalStatus.setApprovalStatus(approvalStatus);
        entityApprovalStatus.setStatusDateTime(new DateTime());
        entityApprovalStatus.setAutoApproved(false);
        entityApprovalStatus.copyAttributesFromEntity((EntitySyncableByMultipleStrategies) entity);
        entityApprovalStatusRepository.save(entityApprovalStatus);
    }

    public EntityApprovalStatusWrapper getLatestEntityApprovalStatus(Long entityId, EntityApprovalStatus.EntityType entityType, String entityUUID) {
        EntityApprovalStatus entityApprovalStatus = entityApprovalStatusRepository.findFirstByEntityIdAndEntityTypeAndIsVoidedFalseOrderByStatusDateTimeDesc(entityId, entityType);
        return entityApprovalStatus == null ? null : EntityApprovalStatusWrapper.fromEntity(entityApprovalStatus, entityUUID);
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return entityApprovalStatusRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }

    private EntityApprovalStatus createEntityApprovalStatus(EntityApprovalStatusRequest request) {
        EntityApprovalStatus.EntityType entityType = EntityApprovalStatus.EntityType.valueOf(request.getEntityType());
        EntityApprovalStatus entityApprovalStatus = entityApprovalStatusRepository.findByUuid(request.getUuid());
        if (entityApprovalStatus == null) {
            entityApprovalStatus = new EntityApprovalStatus();
        }
        entityApprovalStatus.setUuid(request.getUuid());
        entityApprovalStatus.setApprovalStatus(approvalStatusRepository.findByUuid(request.getApprovalStatusUuid()));
        entityApprovalStatus.setApprovalStatusComment(request.getApprovalStatusComment());
        entityApprovalStatus.setVoided(request.isVoided());
        entityApprovalStatus.setEntityType(entityType);
        entityApprovalStatus.setAutoApproved(request.getAutoApproved());
        entityApprovalStatus.setStatusDateTime(request.getStatusDateTime());
        return entityApprovalStatus;
    }

    private CHSEntity getChsEntityByUuid (String entityUuid, EntityApprovalStatus.EntityType entityType) {
        if (typeMap.get(entityType) == null) {
            throw new IllegalArgumentException(String.format("Incorrect entityType '%s' provided for updating EntityApprovalStatus", entityType));
        }
        CHSEntity entity = typeMap.get(entityType).findByUuid(entityUuid);
        if (entity == null) {
            throw new IllegalArgumentException(String.format("Incorrect entityUuid '%s' provided for updating EntityApprovalStatus", entityUuid));
        }
        return entity;
    }
}
