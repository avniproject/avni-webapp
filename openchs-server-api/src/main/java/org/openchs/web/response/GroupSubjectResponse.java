package org.openchs.web.response;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.GroupSubject;
import org.openchs.service.ConceptService;

import java.util.LinkedHashMap;

public class GroupSubjectResponse extends LinkedHashMap<String, Object> {

    public static GroupSubjectResponse fromGroupSubject(GroupSubject groupSubject, ConceptRepository conceptRepository, ConceptService conceptService) {
        GroupSubjectResponse groupSubjectResponse = new GroupSubjectResponse();
        groupSubjectResponse.put("Group subject", SubjectResponse.fromSubject(groupSubject.getGroupSubject(), true, conceptRepository, conceptService));
        groupSubjectResponse.put("Member subject", SubjectResponse.fromSubject(groupSubject.getMemberSubject(), true, conceptRepository, conceptService));
        groupSubjectResponse.put("Voided", groupSubject.isVoided());
        groupSubjectResponse.put("Membership start date", groupSubject.getMembershipStartDate());
        groupSubjectResponse.put("Membership end date", groupSubject.getMembershipEndDate());
        groupSubjectResponse.put("Role", groupSubject.getGroupRole().getRole());
        Response.putAudit(groupSubject, groupSubjectResponse);
        return groupSubjectResponse;
    }
}
