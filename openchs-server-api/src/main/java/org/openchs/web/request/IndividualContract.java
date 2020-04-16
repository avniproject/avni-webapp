package org.openchs.web.request;

import org.openchs.web.request.common.CommonIndividualRequest;

import java.util.*;

public class IndividualContract extends CommonIndividualRequest {

    private String lowestAddressLevel;

    private List<RelationshipContract> relationships = new ArrayList<>();

    private List<ObservationContract> observations = new ArrayList<>();

    private List<EnrolmentContract> enrolments = new ArrayList<>();

    private Set<EncounterContract> encounters = new HashSet<>();

    private SubjectTypeContract subjectType;

    public String getLowestAddressLevel() {
        return lowestAddressLevel;
    }

    public void setLowestAddressLevel(String lowestAddressLevel) {
        this.lowestAddressLevel = lowestAddressLevel;
    }

    public List<RelationshipContract> getRelationships() {
        return relationships;
    }

    public void setRelationships(List<RelationshipContract> relationships) {
        this.relationships = relationships;
    }

    public List<ObservationContract> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationContract> observations) {
        this.observations = observations;
    }

    public List<EnrolmentContract> getEnrolments() {
        return enrolments;
    }

    public void setEnrolments(List<EnrolmentContract> enrolments) {
        this.enrolments = enrolments;
    }

    public Set<EncounterContract> getEncounters() {
        return encounters;
    }

    public void setEncounters(Set<EncounterContract> encounters) {
        this.encounters = encounters;
    }

    public SubjectTypeContract getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectTypeContract subjectType) {
        this.subjectType = subjectType;
    }
}
