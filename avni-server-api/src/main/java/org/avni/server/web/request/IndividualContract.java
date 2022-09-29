package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.web.request.common.CommonIndividualRequest;

import java.util.*;

public class IndividualContract extends CommonIndividualRequest {

    private List<RelationshipContract> relationships = new ArrayList<>();

    @JsonInclude
    private List<ObservationContract> observations = new ArrayList<>();

    private List<EnrolmentContract> enrolments = new ArrayList<>();

    private Set<EncounterContract> encounters = new HashSet<>();

    private List<GroupRoleContract> roles = new ArrayList<>();

    private List<GroupSubjectContract> memberships = new ArrayList<>();

    private SubjectTypeContract subjectType;

    private String subjectTypeName;
    private String fullName;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getSubjectTypeName() {
        return subjectTypeName;
    }

    public void setSubjectTypeName(String subjectTypeName) {
        this.subjectTypeName = subjectTypeName;
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

    public List<GroupRoleContract> getRoles() {
        return roles;
    }

    public void setRoles(List<GroupRoleContract> roles) {
        this.roles = roles;
    }

    public List<GroupSubjectContract> getMemberships() {
        return memberships;
    }

    public void setMemberships(List<GroupSubjectContract> memberships) {
        this.memberships = memberships;
    }

    public SubjectTypeContract getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectTypeContract subjectType) {
        this.subjectType = subjectType;
    }
}
