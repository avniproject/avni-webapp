package org.avni.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "group_subject")
@JsonIgnoreProperties({"groupSubject", "memberSubject", "groupRole"})
public class GroupSubject extends OrganisationAwareEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_subject_id")
    private Individual groupSubject;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_subject_id")
    private Individual memberSubject;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_role_id")
    private GroupRole groupRole;

    @Column
    private DateTime membershipStartDate;

    @Column
    private DateTime membershipEndDate;

    public Individual getGroupSubject() {
        return groupSubject;
    }

    public void setGroupSubject(Individual groupSubject) {
        this.groupSubject = groupSubject;
    }

    public Individual getMemberSubject() {
        return memberSubject;
    }

    public void setMemberSubject(Individual memberSubject) {
        this.memberSubject = memberSubject;
    }

    public GroupRole getGroupRole() {
        return groupRole;
    }

    public void setGroupRole(GroupRole groupRole) {
        this.groupRole = groupRole;
    }

    public DateTime getMembershipStartDate() {
        return membershipStartDate;
    }

    public void setMembershipStartDate(DateTime membershipStartDate) {
        this.membershipStartDate = membershipStartDate;
    }

    public DateTime getMembershipEndDate() {
        return membershipEndDate;
    }

    public void setMembershipEndDate(DateTime membershipEndDate) {
        this.membershipEndDate = membershipEndDate;
    }

    public String getGroupSubjectUUID() {
        return groupSubject.getUuid();
    }

    public String getMemberSubjectUUID() {
        return memberSubject.getUuid();
    }

    public String getGroupRoleUUID() {
        return groupRole.getUuid();
    }

}
