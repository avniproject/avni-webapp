package org.avni.server.web.request.rules.RulesContractWrapper;

import org.joda.time.DateTime;

public class GroupSubjectContractWrapper {
    private String uuid;
    private IndividualContractWrapper groupSubject;
    private IndividualContractWrapper memberSubject;
    private GroupRoleContractWrapper groupRole;
    private DateTime membershipStartDate;
    private DateTime membershipEndDate;
    private boolean voided;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public IndividualContractWrapper getGroupSubject() {
        return groupSubject;
    }

    public void setGroupSubject(IndividualContractWrapper groupSubject) {
        this.groupSubject = groupSubject;
    }

    public IndividualContractWrapper getMemberSubject() {
        return memberSubject;
    }

    public void setMemberSubject(IndividualContractWrapper memberSubject) {
        this.memberSubject = memberSubject;
    }

    public GroupRoleContractWrapper getGroupRole() {
        return groupRole;
    }

    public void setGroupRole(GroupRoleContractWrapper groupRole) {
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
