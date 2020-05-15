package org.openchs.importer.batch.csv.writer.header;

public class GroupMemberHeaders implements Headers {
    public String groupId = "Group Id"; //default dummy value. Is set to the group name + Id in the sample.
    public final String memberId = "Member Id";
    public final String role = "Role";

    @Override
    public String[] getAllHeaders() {
        return new String[]{groupId, memberId, role};
    }
}
