package org.openchs.web.request;

import org.joda.time.DateTime;
import org.openchs.domain.GroupSubject;

public class GroupSubjectContract extends CHSRequest {

    private String groupSubjectUUID;
    private String memberSubjectUUID;
    private String groupRoleUUID;
    private String groupRoleName;
    private DateTime membershipStartDate;
    private DateTime membershipEndDate;

    public static GroupSubjectContract fromEntity(GroupSubject groupSubject) {
        GroupSubjectContract groupSubjectContract = new GroupSubjectContract();
        groupSubjectContract.setUuid(groupSubject.getUuid());
        groupSubjectContract.setGroupSubjectUUID(groupSubject.getGroupSubjectUUID());
        groupSubjectContract.setMemberSubjectUUID(groupSubject.getMemberSubjectUUID());
        groupSubjectContract.setGroupRoleUUID(groupSubject.getGroupRoleUUID());
        groupSubjectContract.setGroupRoleName(groupSubject.getGroupRole().getRole());
        groupSubjectContract.setMembershipStartDate(groupSubject.getMembershipStartDate());
        groupSubjectContract.setMembershipEndDate(groupSubject.getMembershipEndDate());
        return groupSubjectContract;
    }

    public String getGroupSubjectUUID() {
        return groupSubjectUUID;
    }

    public void setGroupSubjectUUID(String groupSubjectUUID) {
        this.groupSubjectUUID = groupSubjectUUID;
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
}
