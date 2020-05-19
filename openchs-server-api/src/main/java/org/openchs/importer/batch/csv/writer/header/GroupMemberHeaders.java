package org.openchs.importer.batch.csv.writer.header;

public class GroupMemberHeaders implements Headers {
    public String groupId = "Group Id"; //default dummy value. Is set to the group name + Id in the sample.
    public final String memberId = "Member Id";
    public final String role = "Role";
    public final String membershipStartDate = "Membership Start Date";
    public final String membershipEndDate = "Membership End Date";

    @Override
    public String[] getAllHeaders() {
        return new String[]{groupId, memberId, role, membershipStartDate, membershipEndDate};
    }
}
