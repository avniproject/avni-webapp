package org.openchs.web.request;

import org.openchs.domain.GroupRole;

public class GroupRoleContract extends CHSRequest {

    private String groupSubjectTypeUUID;
    private String memberSubjectTypeUUID;
    private String role;
    private boolean isPrimary;
    private Long maximumNumberOfMembers;
    private Long minimumNumberOfMembers;

    public static GroupRoleContract fromEntity(GroupRole groupRole) {
        GroupRoleContract groupRoleContract = new GroupRoleContract();
        groupRoleContract.setGroupSubjectTypeUUID(groupRole.getGroupSubjectTypeUUID());
        groupRoleContract.setMemberSubjectTypeUUID(groupRole.getMemberSubjectTypeUUID());
        groupRoleContract.setRole(groupRole.getRole());
        groupRoleContract.setPrimary(groupRole.isPrimary());
        groupRoleContract.setMaximumNumberOfMembers(groupRole.getMaximumNumberOfMembers());
        groupRoleContract.setMinimumNumberOfMembers(groupRole.getMinimumNumberOfMembers());
        return groupRoleContract;
    }

    public String getGroupSubjectTypeUUID() {
        return groupSubjectTypeUUID;
    }

    public void setGroupSubjectTypeUUID(String groupSubjectTypeUUID) {
        this.groupSubjectTypeUUID = groupSubjectTypeUUID;
    }

    public String getMemberSubjectTypeUUID() {
        return memberSubjectTypeUUID;
    }

    public void setMemberSubjectTypeUUID(String memberSubjectTypeUUID) {
        this.memberSubjectTypeUUID = memberSubjectTypeUUID;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }

    public Long getMaximumNumberOfMembers() {
        return maximumNumberOfMembers;
    }

    public void setMaximumNumberOfMembers(Long maximumNumberOfMembers) {
        this.maximumNumberOfMembers = maximumNumberOfMembers;
    }

    public Long getMinimumNumberOfMembers() {
        return minimumNumberOfMembers;
    }

    public void setMinimumNumberOfMembers(Long minimumNumberOfMembers) {
        this.minimumNumberOfMembers = minimumNumberOfMembers;
    }
}
