package org.openchs.web.request.webapp;

import org.openchs.domain.GroupRole;

public class GroupRoleContract {
    private String role;
    private String subjectMemberName;
    private String groupRoleUUID;
    private Long maximumNumberOfMembers;
    private Long minimumNumberOfMembers;
    private boolean isVoided;

    static public GroupRoleContract fromEntity(GroupRole groupRole) {
        GroupRoleContract groupRoleContract = new GroupRoleContract();
        groupRoleContract.setRole(groupRole.getRole());
        groupRoleContract.setGroupRoleUUID(groupRole.getUuid());
        groupRoleContract.setSubjectMemberName(groupRole.getMemberSubjectType().getName());
        groupRoleContract.setMinimumNumberOfMembers(groupRole.getMinimumNumberOfMembers());
        groupRoleContract.setMaximumNumberOfMembers(groupRole.getMaximumNumberOfMembers());
        groupRoleContract.setVoided(groupRole.isVoided());
        return groupRoleContract;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getSubjectMemberName() {
        return subjectMemberName;
    }

    public void setSubjectMemberName(String subjectMemberName) {
        this.subjectMemberName = subjectMemberName;
    }

    public String getGroupRoleUUID() {
        return groupRoleUUID;
    }

    public void setGroupRoleUUID(String groupRoleUUID) {
        this.groupRoleUUID = groupRoleUUID;
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
