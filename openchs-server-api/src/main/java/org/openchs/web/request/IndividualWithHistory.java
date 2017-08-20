package org.openchs.web.request;

import org.openchs.web.request.keyvalue.KeyValueIndividualRequest;
import org.openchs.web.request.keyvalue.KeyValueProgramEncounterRequest;
import org.openchs.web.request.keyvalue.KeyValueProgramEnrolmentRequest;

import java.util.List;

public class IndividualWithHistory {
    private KeyValueIndividualRequest individual;
    private KeyValueProgramEnrolmentRequest enrolment;
    private List<KeyValueProgramEncounterRequest> encounters;

    public KeyValueIndividualRequest getIndividual() {
        return individual;
    }

    public void setIndividual(KeyValueIndividualRequest individual) {
        this.individual = individual;
    }

    public KeyValueProgramEnrolmentRequest getEnrolment() {
        return enrolment;
    }

    public void setEnrolment(KeyValueProgramEnrolmentRequest enrolment) {
        this.enrolment = enrolment;
    }

    public List<KeyValueProgramEncounterRequest> getEncounters() {
        return encounters;
    }

    public void setEncounters(List<KeyValueProgramEncounterRequest> encounters) {
        this.encounters = encounters;
    }
}