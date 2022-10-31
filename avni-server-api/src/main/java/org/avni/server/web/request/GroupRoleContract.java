package org.avni.server.web.request;

import org.avni.server.domain.GroupRole;

public class GroupRoleContract extends CHSRequest {

    private String groupSubjectTypeUUID;
    private String memberSubjectTypeUUID;
    private String role;
    private String subjectMemberName;
    private String groupRoleUUID;
    private Boolean isPrimary;
    private Long maximumNumberOfMembers;
    private Long minimumNumberOfMembers;

    public static GroupRoleContract fromEntity(GroupRole groupRole) {
        GroupRoleContract groupRoleContract = new GroupRoleContract();
        groupRoleContract.setUuid(groupRole.getUuid());
        groupRoleContract.setGroupSubjectTypeUUID(groupRole.getGroupSubjectTypeUUID());
        groupRoleContract.setMemberSubjectTypeUUID(groupRole.getMemberSubjectTypeUUID());
        groupRoleContract.setRole(groupRole.getRole());
        groupRoleContract.setPrimary(groupRole.isPrimary());
        groupRoleContract.setGroupRoleUUID(groupRole.getUuid());
        groupRoleContract.setSubjectMemberName(groupRole.getMemberSubjectType().getName());
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

    public Boolean getPrimary() {
        return isPrimary;
    }

    public void setPrimary(Boolean primary) {
        isPrimary = primary;
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
