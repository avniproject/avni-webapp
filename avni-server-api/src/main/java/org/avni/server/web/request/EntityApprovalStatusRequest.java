package org.avni.server.web.request;

import org.joda.time.DateTime;

public class EntityApprovalStatusRequest {

    private String entityUuid;

    private String entityType;

    private String approvalStatusUuid;

    private String approvalStatusComment;

    private Boolean autoApproved;

    private String uuid;

    private boolean isVoided;

    private DateTime statusDateTime;

    public DateTime getStatusDateTime() {
        return statusDateTime;
    }

    public void setStatusDateTime(DateTime statusDateTime) {
        this.statusDateTime = statusDateTime;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getApprovalStatusUuid() {
        return approvalStatusUuid;
    }

    public void setApprovalStatusUuid(String approvalStatusUuid) {
        this.approvalStatusUuid = approvalStatusUuid;
    }

    public String getApprovalStatusComment() {
        return approvalStatusComment;
    }

    public void setApprovalStatusComment(String approvalStatusComment) {
        this.approvalStatusComment = approvalStatusComment;
    }

    public Boolean getAutoApproved() {
        return autoApproved;
    }

    public void setAutoApproved(Boolean autoApproved) {
        this.autoApproved = autoApproved;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }

    public String getEntityUuid() {
        return entityUuid;
    }

    public void setEntityUuid(String entityUuid) {
        this.entityUuid = entityUuid;
    }
}
