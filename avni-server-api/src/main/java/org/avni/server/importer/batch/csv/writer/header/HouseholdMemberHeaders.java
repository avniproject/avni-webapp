package org.avni.server.importer.batch.csv.writer.header;

import org.avni.server.domain.SubjectType;

public class HouseholdMemberHeaders extends GroupMemberHeaders implements Headers {
    public final static String groupId = "Household Id";
    public final static String isHeadOfHousehold = "Is head of household (yes|no)";
    public final static String relationshipWithHeadOfHousehold = "Relation name with Head of Household";

    public HouseholdMemberHeaders(SubjectType memberSubjectType) {
        super(memberSubjectType);
    }

    @Override
    public String[] getAllHeaders() {
        return new String[]{groupId, memberId, isHeadOfHousehold, relationshipWithHeadOfHousehold, membershipStartDate, membershipEndDate};
    }
}
