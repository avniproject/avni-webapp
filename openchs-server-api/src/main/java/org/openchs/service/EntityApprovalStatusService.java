package org.openchs.service;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.ApprovalStatus;
import org.openchs.domain.CHSEntity;
import org.openchs.domain.EntityApprovalStatus;
import org.openchs.web.request.EntityApprovalStatusRequest;
import org.openchs.web.request.rules.RulesContractWrapper.EntityApprovalStatusWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.openchs.domain.EntityApprovalStatus.EntityType.*;

@Service
public class EntityApprovalStatusService {

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
        EntityApprovalStatus entityApprovalStatus = entityApprovalStatusRepository.findByUuid(request.getUuid());
        if (entityApprovalStatus == null) {
            entityApprovalStatus = new EntityApprovalStatus();
        }
        EntityApprovalStatus.EntityType entityType = EntityApprovalStatus.EntityType.valueOf(request.getEntityType());
        entityApprovalStatus.setUuid(request.getUuid());
        entityApprovalStatus.setApprovalStatus(approvalStatusRepository.findByUuid(request.getApprovalStatusUuid()));
        entityApprovalStatus.setApprovalStatusComment(request.getApprovalStatusComment());
        entityApprovalStatus.setVoided(request.isVoided());
        entityApprovalStatus.setEntityType(entityType);
        entityApprovalStatus.setAutoApproved(request.getAutoApproved());
        entityApprovalStatus.setStatusDateTime(request.getStatusDateTime());
        entityApprovalStatus.updateAudit();
        if (typeMap.get(entityType) == null) {
            throw new IllegalArgumentException(String.format("Incorrect entityType '%s' provided for updating EntityApprovalStatus", entityType));
        }
        CHSEntity entity = typeMap.get(entityType).findByUuid(request.getEntityUuid());
        if (entity == null) {
            throw new IllegalArgumentException(String.format("Incorrect entityUuid '%s' provided for updating EntityApprovalStatus", request.getEntityUuid()));
        }
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

    public void createDefaultStatus(EntityApprovalStatus.EntityType entityType, Long entityId) {
        ApprovalStatus pendingStatus = approvalStatusRepository.findByStatus(ApprovalStatus.Status.Pending);
        List<EntityApprovalStatus> entityApprovalStatuses = entityApprovalStatusRepository.findByEntityIdAndEntityTypeAndApprovalStatusAndIsVoidedFalse(entityId, entityType, pendingStatus);
        if (!entityApprovalStatuses.isEmpty()) {
            return;
        }
        EntityApprovalStatus entityApprovalStatus = new EntityApprovalStatus();
        entityApprovalStatus.assignUUID();
        entityApprovalStatus.setEntityType(entityType);
        entityApprovalStatus.setEntityId(entityId);
        entityApprovalStatus.setApprovalStatus(pendingStatus);
        entityApprovalStatus.setStatusDateTime(new DateTime());
        entityApprovalStatus.setAutoApproved(false);
        entityApprovalStatusRepository.save(entityApprovalStatus);
    }

    public EntityApprovalStatusWrapper getLatestEntityApprovalStatus(Long entityId, EntityApprovalStatus.EntityType entityType, String entityUUID) {
        EntityApprovalStatus entityApprovalStatus = entityApprovalStatusRepository.findFirstByEntityIdAndEntityTypeAndIsVoidedFalseOrderByStatusDateTimeDesc(entityId, entityType);
        return entityApprovalStatus == null ? null : EntityApprovalStatusWrapper.fromEntity(entityApprovalStatus, entityUUID);
    }

}
