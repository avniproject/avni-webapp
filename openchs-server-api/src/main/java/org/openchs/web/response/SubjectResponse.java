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
        subjectResponse.put("Registration date", subject.getRegistrationDate());
        putIfPresent(subjectResponse, "First name", subject.getFirstName());
        putIfPresent(subjectResponse, "Last name", subject.getLastName());
        putIfPresent(subjectResponse, "Date of birth", subject.getDateOfBirth());
        if (subject.getGender() != null) subjectResponse.put("Gender", subject.getGender().getName());

        LinkedHashMap<String, String> location = new LinkedHashMap<>();
        AddressLevel addressLevel = subject.getAddressLevel();
        while (addressLevel != null) {
            putAddressLevel(location, addressLevel);
            addressLevel = addressLevel.getParent();
        }
        subjectResponse.put("location", location);

        if (subject.getFacility() != null) subjectResponse.put("Facility", subject.getFacility().getName());
        putIfPresent(subjectResponse, "Registration location", subject.getRegistrationLocation());

        ArrayList<SubjectRelationshipResponse> relatives = new ArrayList<>();
        subject.getRelationshipsFromSelfToOthers().forEach(individualRelationship -> {
            relatives.add(SubjectRelationshipResponse.fromSubjectRelationship(individualRelationship));
        });
        if (relatives.size() != 0)
            subjectResponse.put("relatives", relatives);

        subject.getObservations().forEach((key, value) -> {
            Concept concept = conceptRepository.findByUuid(key);
            subjectResponse.put(concept.getName(), conceptService.getObservationValue(concept, value));
        });

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

    private static void putAddressLevel(Map<String, String> map, AddressLevel addressLevel) {
        map.put(addressLevel.getTypeString(), addressLevel.getTitle());
    }

    private static void putIfPresent(SubjectResponse subjectResponse, String name, Object value) {
        if (value != null) subjectResponse.put(name, value);
    }
}