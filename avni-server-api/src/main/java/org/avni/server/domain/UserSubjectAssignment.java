package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "user_subject_assignment")
@BatchSize(size = 100)
public class
UserSubjectAssignment extends OrganisationAwareEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Individual subject;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Individual getSubject() {
        return subject;
    }

    public String getSubjectIdAsString() {
        return String.valueOf(subject.getId());
    }

    public void setSubject(Individual subject) {
        this.subject = subject;
    }
}
