package org.avni.server.web.request.rules.RulesContractWrapper;

import org.joda.time.DateTime;

public class GroupSubjectContract {
    private String uuid;
    private IndividualContract groupSubject;
    private IndividualContract memberSubject;
    private GroupRoleContract groupRole;
    private DateTime membershipStartDate;
    private DateTime membershipEndDate;
    private boolean voided;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public IndividualContract getGroupSubject() {
        return groupSubject;
    }

    public void setGroupSubject(IndividualContract groupSubject) {
        this.groupSubject = groupSubject;
    }

    public IndividualContract getMemberSubject() {
        return memberSubject;
    }

    public void setMemberSubject(IndividualContract memberSubject) {
        this.memberSubject = memberSubject;
    }

    public GroupRoleContract getGroupRole() {
        return groupRole;
    }

    public void setGroupRole(GroupRoleContract groupRole) {
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

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }
}
