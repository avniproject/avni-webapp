package org.avni.server.web.request;

import org.joda.time.DateTime;
import org.avni.server.domain.GroupSubject;
import org.avni.server.domain.Individual;

public class GroupSubjectContract extends CHSRequest {

    private String groupSubjectUUID;
    private String groupSubjectName;
    private String memberSubjectUUID;
    private String groupRoleUUID;
    private String groupRoleName;
    private DateTime membershipStartDate;
    private DateTime membershipEndDate;
    private SubjectTypeContract groupSubjectSubjectType;

    public static GroupSubjectContract fromEntity(GroupSubject groupSubject) {
        GroupSubjectContract groupSubjectContract = new GroupSubjectContract();
        Individual groupS = groupSubject.getGroupSubject();
        groupSubjectContract.setUuid(groupSubject.getUuid());
        groupSubjectContract.setGroupSubjectUUID(groupSubject.getGroupSubjectUUID());
        groupSubjectContract.setGroupSubjectName(groupS.getFirstName()
                + (groupS.getLastName() != null ? " " + groupS.getLastName() : ""));
        groupSubjectContract.setMemberSubjectUUID(groupSubject.getMemberSubjectUUID());
        groupSubjectContract.setGroupRoleUUID(groupSubject.getGroupRoleUUID());
        groupSubjectContract.setGroupRoleName(groupSubject.getGroupRole().getRole());
        groupSubjectContract.setMembershipStartDate(groupSubject.getMembershipStartDate());
        groupSubjectContract.setMembershipEndDate(groupSubject.getMembershipEndDate());
        groupSubjectContract.setGroupSubjectSubjectType(SubjectTypeContract.fromSubjectType(groupS.getSubjectType()));
        return groupSubjectContract;
    }

    public String getGroupSubjectUUID() {
        return groupSubjectUUID;
    }

    public void setGroupSubjectUUID(String groupSubjectUUID) {
        this.groupSubjectUUID = groupSubjectUUID;
    }

    public String getGroupSubjectName() {
        return groupSubjectName;
    }

    public void setGroupSubjectName(String groupSubjectName) {
        this.groupSubjectName = groupSubjectName;
    }

    public String getMemberSubjectUUID() {
        return memberSubjectUUID;
    }

    public void setMemberSubjectUUID(String memberSubjectUUID) {
        this.memberSubjectUUID = memberSubjectUUID;
    }

    public String getGroupRoleUUID() {
        return groupRoleUUID;
    }

    public void setGroupRoleUUID(String groupRoleUUID) {
        this.groupRoleUUID = groupRoleUUID;
    }

    public String getGroupRoleName() {
        return groupRoleName;
    }

    public void setGroupRoleName(String groupRoleName) {
        this.groupRoleName = groupRoleName;
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

    public SubjectTypeContract getGroupSubjectSubjectType() {
        return groupSubjectSubjectType;
    }

    public void setGroupSubjectSubjectType(SubjectTypeContract groupSubjectSubjectType) {
        this.groupSubjectSubjectType = groupSubjectSubjectType;
    }
}
