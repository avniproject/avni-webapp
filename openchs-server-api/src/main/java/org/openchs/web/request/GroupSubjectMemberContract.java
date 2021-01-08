package org.openchs.web.request;

import org.openchs.web.request.common.CommonIndividualRequest;

public class GroupSubjectMemberContract {
    IndividualContract group;
    IndividualContract member;
    GroupRoleContract role;
    EncounterMetadataContract encounterMetadata;

    public IndividualContract getGroup() {
        return group;
    }

    public void setGroup(IndividualContract group) {
        this.group = group;
    }

    public CommonIndividualRequest getMember() {
        return member;
    }

    public void setMember(IndividualContract member) {
        this.member = member;
    }

    public GroupRoleContract getRole() {
        return role;
    }

    public void setRole(GroupRoleContract role) {
        this.role = role;
    }

    public EncounterMetadataContract getEncounterMetadata() {
        return encounterMetadata;
    }

    public void setEncounterMetadata(EncounterMetadataContract encounterMetadata) {
        this.encounterMetadata = encounterMetadata;
    }
}
