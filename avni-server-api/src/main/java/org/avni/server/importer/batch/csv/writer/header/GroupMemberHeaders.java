package org.avni.server.importer.batch.csv.writer.header;

import org.avni.server.domain.SubjectType;

public class GroupMemberHeaders implements Headers {
    private final SubjectType memberSubjectType;
    public String groupId = "Group Id"; //default dummy value. Is set to the group name + Id in the sample.
    public final static String memberId = "Member Id";
    public final static String role = "Role";
    public final static String membershipStartDate = "Membership Start Date";
    public final static String membershipEndDate = "Membership End Date";

    public GroupMemberHeaders(SubjectType memberSubjectType) {
        this.memberSubjectType = memberSubjectType;
    }

    @Override
    public String[] getAllHeaders() {
        return new String[]{groupId, memberId, role, membershipStartDate, membershipEndDate};
    }
}
