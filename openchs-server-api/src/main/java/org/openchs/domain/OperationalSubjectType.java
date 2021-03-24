package org.openchs.domain;

import org.joda.time.DateTime;
import org.openchs.application.Subject;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "operational_subject_type")
public class OperationalSubjectType extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_type_id")
    private SubjectType subjectType;

    @Column
    private String name;

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSubjectTypeUUID() {
        return subjectType.getUuid();
    }

    public Boolean getSubjectTypeVoided() {
        return subjectType.isVoided();
    }

    public String getSubjectTypeName() {
        return subjectType.getName();
    }

    public boolean getActive() {
        return subjectType.getActive();
    }

    public boolean isGroup() {
        return subjectType.isGroup();
    }

    public boolean isHousehold() {
        return subjectType.isHousehold();
    }

    public Subject getType() {
        return subjectType.getType();
    }

    public String getSubjectSummaryRule() {
        return subjectType.getSubjectSummaryRule();
    }

    public boolean isUniqueName() {
        return subjectType.isUniqueName();
    }

    public DateTime getLastModifiedDateTime() {
        return getSubjectType().getLastModifiedDateTime().isAfter(getAudit().getLastModifiedDateTime()) ? getSubjectType().getLastModifiedDateTime() : getAudit().getLastModifiedDateTime();
    }

    @Override
    public boolean isVoided() {
        return subjectType.isVoided() || super.isVoided();
    }
}
