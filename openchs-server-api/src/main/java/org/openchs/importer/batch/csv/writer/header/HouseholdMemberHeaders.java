package org.openchs.importer.batch.csv.writer.header;

public class HouseholdMemberHeaders extends GroupMemberHeaders implements Headers {
    public final String groupId = "Household Id";
    public final String isHeadOfHousehold = "Is head of household (yes|no)";
    public final String relationshipWithHeadOfHousehold = "Relation name with Head of Household";

    @Override
    public String[] getAllHeaders() {
        return new String[]{groupId, memberId, isHeadOfHousehold, relationshipWithHeadOfHousehold, membershipStartDate, membershipEndDate};
    }
}
