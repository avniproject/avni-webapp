package org.openchs.web.request;

import org.joda.time.DateTime;

public class GroupSubjectContract extends CHSRequest {

    private String groupSubjectUUID;
    private String memberSubjectUUID;
    private String groupRoleUUID;
    private DateTime membershipStartDate;
    private DateTime membershipEndDate;

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
