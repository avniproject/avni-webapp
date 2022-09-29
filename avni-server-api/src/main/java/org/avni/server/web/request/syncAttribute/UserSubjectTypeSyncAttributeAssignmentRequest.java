package org.avni.server.web.request.syncAttribute;

import org.avni.server.domain.SubjectType;
import org.avni.server.service.ConceptService;
import org.avni.server.web.request.CHSRequest;

public class UserSubjectTypeSyncAttributeAssignmentRequest extends CHSRequest {
    private String name;
    private ConceptSyncAttributeContract syncAttribute1;
    private ConceptSyncAttributeContract syncAttribute2;

    public static UserSubjectTypeSyncAttributeAssignmentRequest fromSubjectType(SubjectType subjectType, ConceptService conceptService) {
        UserSubjectTypeSyncAttributeAssignmentRequest request = new UserSubjectTypeSyncAttributeAssignmentRequest();
        request.setId(subjectType.getId());
        request.setUuid(subjectType.getUuid());
        request.setName(subjectType.getName());
        if (subjectType.getSyncRegistrationConcept1() != null) {
            request.setSyncAttribute1(ConceptSyncAttributeContract.fromConcept(conceptService.get(subjectType.getSyncRegistrationConcept1())));
        }
        if (subjectType.getSyncRegistrationConcept2() != null) {
            request.setSyncAttribute2(ConceptSyncAttributeContract.fromConcept(conceptService.get(subjectType.getSyncRegistrationConcept2())));
        }
        return request;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ConceptSyncAttributeContract getSyncAttribute1() {
        return syncAttribute1;
    }

    public void setSyncAttribute1(ConceptSyncAttributeContract syncAttribute1) {
        this.syncAttribute1 = syncAttribute1;
    }

    public ConceptSyncAttributeContract getSyncAttribute2() {
        return syncAttribute2;
    }

    public void setSyncAttribute2(ConceptSyncAttributeContract syncAttribute2) {
        this.syncAttribute2 = syncAttribute2;
    }
}
