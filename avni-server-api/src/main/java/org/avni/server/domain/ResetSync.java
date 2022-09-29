package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;

@Entity
@Table(name = "reset_sync")
@BatchSize(size = 100)
public class ResetSync extends OrganisationAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_type_id")
    private SubjectType subjectType;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }
}
