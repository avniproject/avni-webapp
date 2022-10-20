package org.avni.server.web.request.rules.RulesContractWrapper;

import org.avni.server.domain.GroupRole;
import org.avni.server.web.request.SubjectTypeContract;

public class GroupRoleContract implements RuleServerEntityContract {
    private String uuid;
    private SubjectTypeContract groupSubjectType;
    private SubjectTypeContract memberSubjectType;
    private String role;
    private boolean primary;
    private double maximumNumberOfMembers;
    private double minimumNumberOfMembers;
    private boolean voided;

    public static GroupRoleContract fromGroupRole(GroupRole groupRole) {
        GroupRoleContract groupRoleContract = new GroupRoleContract();
        groupRoleContract.setUuid(groupRole.getUuid());
        groupRoleContract.setGroupSubjectType(SubjectTypeContract.fromSubjectType(groupRole.getGroupSubjectType()));
        groupRoleContract.setMemberSubjectType(SubjectTypeContract.fromSubjectType(groupRole.getMemberSubjectType()));
        groupRoleContract.setRole(groupRole.getRole());
        groupRoleContract.setPrimary(groupRole.isPrimary());
        groupRoleContract.setMaximumNumberOfMembers(groupRole.getMaximumNumberOfMembers());
        groupRoleContract.setMinimumNumberOfMembers(groupRole.getMinimumNumberOfMembers());
        groupRoleContract.setVoided(groupRole.isVoided());
        return groupRoleContract;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public SubjectTypeContract getGroupSubjectType() {
        return groupSubjectType;
    }

    public void setGroupSubjectType(SubjectTypeContract groupSubjectType) {
        this.groupSubjectType = groupSubjectType;
    }

    public SubjectTypeContract getMemberSubjectType() {
        return memberSubjectType;
    }

    public void setMemberSubjectType(SubjectTypeContract memberSubjectType) {
        this.memberSubjectType = memberSubjectType;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isPrimary() {
        return primary;
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
    }

    public double getMaximumNumberOfMembers() {
        return maximumNumberOfMembers;
    }

    public void setMaximumNumberOfMembers(double maximumNumberOfMembers) {
        this.maximumNumberOfMembers = maximumNumberOfMembers;
    }

    public double getMinimumNumberOfMembers() {
        return minimumNumberOfMembers;
    }

    public void setMinimumNumberOfMembers(double minimumNumberOfMembers) {
        this.minimumNumberOfMembers = minimumNumberOfMembers;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }
}
