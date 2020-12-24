package org.openchs.web.request;

import org.openchs.web.request.common.CommonIndividualRequest;

public class GroupSubjectMemberContract {
    CommonIndividualRequest member;
    GroupRoleContract role;

    public CommonIndividualRequest getMember() {
        return member;
    }

    public void setMember(CommonIndividualRequest member) {
        this.member = member;
    }

    public GroupRoleContract getRole() {
        return role;
    }

    public void setRole(GroupRoleContract role) {
        this.role = role;
    }
}
