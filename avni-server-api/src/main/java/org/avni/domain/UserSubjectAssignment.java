package org.avni.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;

@Entity
@Table(name = "user_subject_assignment")
@BatchSize(size = 100)
public class UserSubjectAssignment extends OrganisationAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Individual subject;

    public UserSubjectAssignment() {
    }

    public UserSubjectAssignment(User user, Individual subject) {
        this.user = user;
        this.subject = subject;
    }

    public User getUser() {
        return user;
    }

    public Individual getSubject() {
        return subject;
    }

}
