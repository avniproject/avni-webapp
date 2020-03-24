package org.openchs.web.request;

public class GroupRoleContract extends CHSRequest {

    private String groupSubjectTypeUUID;
    private String memberSubjectTypeUUID;
    private String role;
    private boolean isPrimary;
    private Long maximumNumberOfMembers;
    private Long minimumNumberOfMembers;

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
