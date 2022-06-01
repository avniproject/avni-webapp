package org.avni.web.response;

import org.avni.dao.ConceptRepository;
import org.avni.domain.GroupSubject;
import org.avni.service.ConceptService;
import org.avni.service.S3Service;

import java.util.LinkedHashMap;

public class GroupSubjectResponse extends LinkedHashMap<String, Object> {

    public static GroupSubjectResponse fromGroupSubject(GroupSubject groupSubject, ConceptRepository conceptRepository, ConceptService conceptService, S3Service s3Service) {
        GroupSubjectResponse groupSubjectResponse = new GroupSubjectResponse();
        groupSubjectResponse.put("Group subject", SubjectResponse.fromSubject(groupSubject.getGroupSubject(), true, conceptRepository, conceptService, s3Service));
        groupSubjectResponse.put("Member subject", SubjectResponse.fromSubject(groupSubject.getMemberSubject(), true, conceptRepository, conceptService, s3Service));
        groupSubjectResponse.put("Voided", groupSubject.isVoided());
        groupSubjectResponse.put("Membership start date", groupSubject.getMembershipStartDate());
        groupSubjectResponse.put("Membership end date", groupSubject.getMembershipEndDate());
        groupSubjectResponse.put("Role", groupSubject.getGroupRole().getRole());
        Response.putAudit(groupSubject, groupSubjectResponse);
        return groupSubjectResponse;
    }
}
