package org.openchs.web.response;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.CHSBaseEntity;
import org.openchs.domain.Concept;
import org.openchs.domain.Individual;
import org.openchs.service.ConceptService;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class SubjectResponse extends LinkedHashMap<String, Object> {
    public static SubjectResponse fromSubject(Individual subject, boolean includeSubjectType, ConceptRepository conceptRepository, ConceptService conceptService) {
        SubjectResponse subjectResponse = new SubjectResponse();
        if (includeSubjectType) subjectResponse.put("Subject type", subject.getSubjectType().getName());
        subjectResponse.put("ID", subject.getUuid());
        putIfPresent(subjectResponse, "Registration location", subject.getRegistrationLocation());
        subjectResponse.put("Registration date", subject.getRegistrationDate());
        putLocation(subject, subjectResponse);
        if (subject.getFacility() != null) subjectResponse.put("Facility", subject.getFacility().getName());
        putRelatives(subject, subjectResponse);

        LinkedHashMap<String, Object> observations = new LinkedHashMap<>();
        putIfPresent(observations, "First name", subject.getFirstName());
        putIfPresent(observations, "Last name", subject.getLastName());
        putIfPresent(observations, "Date of birth", subject.getDateOfBirth());
        if (subject.getGender() != null) observations.put("Gender", subject.getGender().getName());
        subject.getObservations().forEach((key, value) -> {
            Concept concept = conceptRepository.findByUuid(key);
            observations.put(concept.getName(), conceptService.getObservationValue(concept, value));
        });
        subjectResponse.put("observations", observations);

        subjectResponse.put("encounters", new ArrayList<>(subject.getEncounters().stream().map(CHSBaseEntity::getUuid).collect(Collectors.toList())));
        subjectResponse.put("enrolments", new ArrayList<>(subject.getProgramEnrolments().stream().map(CHSBaseEntity::getUuid).collect(Collectors.toList())));

        LinkedHashMap<String, Object> audit = new LinkedHashMap<>();
        audit.put("Created at", subject.getCreatedDateTime());
        audit.put("Last modified at", subject.getLastModifiedDateTime());
        audit.put("Created by", subject.getCreatedBy());
        audit.put("Last modified by", subject.getLastModifiedBy());
        subjectResponse.put("audit", audit);

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

    private static void putIfPresent(Map<String, Object> map, String name, Object value) {
        if (value != null) map.put(name, value);
    }
}