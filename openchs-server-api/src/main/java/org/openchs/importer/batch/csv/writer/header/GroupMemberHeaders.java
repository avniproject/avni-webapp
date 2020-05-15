package org.openchs.importer.batch.csv.writer.header;

public class GroupMemberHeaders implements Headers {
    public final String groupId = "Group Id";
    public final String memberId = "Member Id";
    public final String role = "Role";

    @Override
    public String[] getAllHeaders() {
        return new String[]{groupId, memberId, role};
    }
}
