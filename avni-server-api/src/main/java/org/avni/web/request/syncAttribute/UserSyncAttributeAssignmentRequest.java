package org.avni.web.request.syncAttribute;

import org.avni.domain.SubjectType;
import org.avni.service.ConceptService;

import java.util.List;
import java.util.stream.Collectors;

public class UserSyncAttributeAssignmentRequest {
    private List<UserSubjectTypeSyncAttributeAssignmentRequest> subjectTypes;
    private boolean isAnySubjectTypeSyncByLocation;
    private boolean isAnySubjectTypeDirectlyAssignable;

    public UserSyncAttributeAssignmentRequest(List<SubjectType> subjectTypes,
                                              boolean isAnySubjectTypeSyncByLocation,
                                              boolean isAnySubjectTypeDirectlyAssignable, ConceptService conceptService) {
        this.isAnySubjectTypeDirectlyAssignable = isAnySubjectTypeDirectlyAssignable;
        this.isAnySubjectTypeSyncByLocation = isAnySubjectTypeSyncByLocation;
        this.subjectTypes = subjectTypes.stream()
                .map(st -> UserSubjectTypeSyncAttributeAssignmentRequest.fromSubjectType(st, conceptService))
                .collect(Collectors.toList());
    }

    public List<UserSubjectTypeSyncAttributeAssignmentRequest> getSubjectTypes() {
        return subjectTypes;
    }

    public void setSubjectTypes(List<UserSubjectTypeSyncAttributeAssignmentRequest> subjectTypes) {
        this.subjectTypes = subjectTypes;
    }

    public boolean isAnySubjectTypeSyncByLocation() {
        return isAnySubjectTypeSyncByLocation;
    }

    public boolean isAnySubjectTypeDirectlyAssignable() {
        return isAnySubjectTypeDirectlyAssignable;
    }
}
