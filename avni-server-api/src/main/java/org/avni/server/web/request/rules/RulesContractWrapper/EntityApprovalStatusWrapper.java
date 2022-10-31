package org.avni.server.web.request.rules.RulesContractWrapper;

import org.avni.server.domain.ApprovalStatus;
import org.avni.server.domain.EntityApprovalStatus;

public class EntityApprovalStatusWrapper {
    private String uuid;
    private String entityType;
    private String approvalStatusComment;
    private boolean autoApproved;
    private boolean voided;
    private String entityUUID;
    private ApprovalStatus approvalStatus;

    public static EntityApprovalStatusWrapper fromEntity(EntityApprovalStatus entityApprovalStatus, String entityUUID) {
        EntityApprovalStatusWrapper wrapper = new EntityApprovalStatusWrapper();
        wrapper.setUuid(entityApprovalStatus.getUuid());
        wrapper.setEntityType(entityApprovalStatus.getEntityType().name());
        wrapper.setApprovalStatusComment(entityApprovalStatus.getApprovalStatusComment());
        wrapper.setAutoApproved(entityApprovalStatus.getAutoApproved());
        wrapper.setVoided(entityApprovalStatus.isVoided());
        wrapper.setEntityUUID(entityUUID);
        wrapper.setApprovalStatus(entityApprovalStatus.getApprovalStatus());
        return wrapper;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getApprovalStatusComment() {
        return approvalStatusComment;
    }

    public void setApprovalStatusComment(String approvalStatusComment) {
        this.approvalStatusComment = approvalStatusComment;
    }

    public boolean isAutoApproved() {
        return autoApproved;
    }

    public void setAutoApproved(boolean autoApproved) {
        this.autoApproved = autoApproved;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }

    public String getEntityUUID() {
        return entityUUID;
    }

    public void setEntityUUID(String entityUUID) {
        this.entityUUID = entityUUID;
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }
}
