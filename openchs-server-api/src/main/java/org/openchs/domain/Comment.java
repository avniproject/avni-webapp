package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.openchs.util.S;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "comment")
@BatchSize(size = 100)
@JsonIgnoreProperties({"subject"})
public class Comment extends OrganisationAwareEntity {

    @NotNull
    private String text;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id")
    private Individual subject;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Individual getSubject() {
        return subject;
    }

    public void setSubject(Individual subject) {
        this.subject = subject;
    }

    public String getSubjectUUID() {
        return this.subject.getUuid();
    }

    public String getDisplayUsername() {
        User createdByUser = this.getAudit().getCreatedBy();
        return S.isEmpty(createdByUser.getName()) ? createdByUser.getUsername() : createdByUser.getName();
    }
}
