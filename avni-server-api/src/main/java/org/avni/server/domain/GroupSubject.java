package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "group_subject")
@JsonIgnoreProperties({"groupSubject", "memberSubject", "groupRole"})
@BatchSize(size = 100)
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

    @Column(name = "member_subject_address_id")
    private Long memberSubjectAddressId;

    @Column(name = "group_subject_address_id")
    private Long groupSubjectAddressId;

    @Column(name = "group_subject_sync_concept_1_value")
    private String groupSubjectSyncConcept1Value;

    @Column(name = "group_subject_sync_concept_2_value")
    private String groupSubjectSyncConcept2Value;

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

    @JsonIgnore
    public Long getMemberSubjectAddressId() {
        return memberSubjectAddressId;
    }

    public void setMemberSubjectAddressId(Long memberSubjectAddressId) {
        this.memberSubjectAddressId = memberSubjectAddressId;
    }

    @JsonIgnore
    public Long getGroupSubjectAddressId() {
        return groupSubjectAddressId;
    }

    public void setGroupSubjectAddressId(Long groupSubjectAddressId) {
        this.groupSubjectAddressId = groupSubjectAddressId;
    }

    @JsonIgnore
    public String getGroupSubjectSyncConcept1Value() {
        return groupSubjectSyncConcept1Value;
    }

    public void setGroupSubjectSyncConcept1Value(String groupSubjectSyncConcept1Value) {
        this.groupSubjectSyncConcept1Value = groupSubjectSyncConcept1Value;
    }

    @JsonIgnore
    public String getGroupSubjectSyncConcept2Value() {
        return groupSubjectSyncConcept2Value;
    }

    public void setGroupSubjectSyncConcept2Value(String groupSubjectSyncConcept2Value) {
        this.groupSubjectSyncConcept2Value = groupSubjectSyncConcept2Value;
    }

}
