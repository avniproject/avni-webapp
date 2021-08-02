package org.openchs.web.response;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.GroupSubject;
import org.openchs.domain.Individual;
import org.openchs.service.ConceptService;

import java.util.*;

public class SubjectResponse extends LinkedHashMap<String, Object> {
    public static SubjectResponse fromSubject(Individual subject, boolean includeSubjectType, ConceptRepository conceptRepository, ConceptService conceptService) {
        SubjectResponse subjectResponse = new SubjectResponse();
        if (includeSubjectType) subjectResponse.put("Subject type", subject.getSubjectType().getName());
        subjectResponse.put("ID", subject.getUuid());
        subjectResponse.put("Voided", subject.isVoided());
        Response.putIfPresent(subjectResponse, "Registration location", subject.getRegistrationLocation());
        subjectResponse.put("Registration date", subject.getRegistrationDate());
        putLocation(subject, subjectResponse);
        if (subject.getFacility() != null) subjectResponse.put("Facility", subject.getFacility().getName());
        putRelatives(subject, subjectResponse);

        LinkedHashMap<String, Object> observations = new LinkedHashMap<>();
        Response.putIfPresent(observations, "First name", subject.getFirstName());
        Response.putIfPresent(observations, "Last name", subject.getLastName());
        Response.putIfPresent(observations, "Date of birth", subject.getDateOfBirth());
        if (subject.getGender() != null) observations.put("Gender", subject.getGender().getName());
        Response.putObservations(conceptRepository, conceptService, subjectResponse, observations, subject.getObservations());

        Response.putChildren(subjectResponse, "encounters", new HashSet<>(subject.getEncounters()));
        Response.putChildren(subjectResponse, "enrolments", new HashSet<>(subject.getProgramEnrolments()));

        Response.putAudit(subject, subjectResponse);

        return subjectResponse;
    }

    private static void putRelatives(Individual subject, SubjectResponse subjectResponse) {
        ArrayList<SubjectRelationshipResponse> relatives = new ArrayList<>();
        subject.getRelationshipsFromSelfToOthers().forEach(individualRelationship -> {
            relatives.add(SubjectRelationshipResponse.fromSubjectRelationship(individualRelationship));
        });
        if (relatives.size() != 0)
            subjectResponse.put("relatives", relatives);
    }

    private static void putLocation(Individual subject, SubjectResponse subjectResponse) {
        LinkedHashMap<String, String> location = new LinkedHashMap<>();
        AddressLevel addressLevel = subject.getAddressLevel();
        while (addressLevel != null) {
            putAddressLevel(location, addressLevel);
            addressLevel = addressLevel.getParent();
        }
        subjectResponse.put("location", location);
    }

    private static void putAddressLevel(Map<String, String> map, AddressLevel addressLevel) {
        map.put(addressLevel.getTypeString(), addressLevel.getTitle());
    }

    public static SubjectResponse fromSubject(Individual subject, boolean subjectTypeRequested, ConceptRepository conceptRepository, ConceptService conceptService, List<GroupSubject> groups) {
        SubjectResponse subjectResponse = fromSubject(subject, subjectTypeRequested, conceptRepository, conceptService);
        subjectResponse.put("Groups", groups.stream().map(groupSubject -> groupSubject.getGroupSubjectUUID()));
        return subjectResponse;
    }
}
