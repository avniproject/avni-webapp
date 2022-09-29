package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@BatchSize(size = 100)
@JsonIgnoreProperties({"approvalStatus"})
public class EntityApprovalStatus extends OrganisationAwareEntity {

    @Column
    private Long entityId;

    @Column
    @Enumerated(EnumType.STRING)
    private EntityType entityType;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approval_status_id")
    private ApprovalStatus approvalStatus;

    @Column
    private String approvalStatusComment;

    @Column
    private Boolean autoApproved;

    @Column
    @NotNull
    private DateTime statusDateTime;

    public enum EntityType {
        Subject,
        ProgramEnrolment,
        ProgramEncounter,
        Encounter,
        ChecklistItem
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
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

    public DateTime getStatusDateTime() {
        return statusDateTime;
    }

    public void setStatusDateTime(DateTime statusDateTime) {
        this.statusDateTime = statusDateTime;
    }

}
