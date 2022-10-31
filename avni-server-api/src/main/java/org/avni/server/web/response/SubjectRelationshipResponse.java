package org.avni.server.web.response;

import org.avni.server.domain.individualRelationship.IndividualRelationship;

import java.util.HashMap;


public class SubjectRelationshipResponse extends HashMap<String, Object> {
    public static SubjectRelationshipResponse fromSubjectRelationship(IndividualRelationship individualRelationship) {
        SubjectRelationshipResponse subjectRelationshipResponse = new SubjectRelationshipResponse();
        subjectRelationshipResponse.put("Voided", individualRelationship.isVoided());
        subjectRelationshipResponse.put("Relationship type", individualRelationship.getRelationship().getName());
        subjectRelationshipResponse.put("Relative ID", individualRelationship.getIndividualB().getUuid());
        subjectRelationshipResponse.put("Relative external ID", individualRelationship.getIndividualB().getLegacyId());
        subjectRelationshipResponse.put("Enter date", individualRelationship.getEnterDateTime());
        subjectRelationshipResponse.put("Exit date", individualRelationship.getExitDateTime());
        return subjectRelationshipResponse;
    }
}
