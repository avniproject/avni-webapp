package org.openchs.web.request;

import java.util.List;

public class IndividualWithHistory {
    private IndividualRequest individual;
    private ProgramEnrolmentRequest enrolment;
    private List<ProgramEncounterRequest> encounters;

    public IndividualRequest getIndividual() {
        return individual;
    }

    public void setIndividual(IndividualRequest individual) {
        this.individual = individual;
    }

    public ProgramEnrolmentRequest getEnrolment() {
        return enrolment;
    }

    public void setEnrolment(ProgramEnrolmentRequest enrolment) {
        this.enrolment = enrolment;
    }

    public List<ProgramEncounterRequest> getEncounters() {
        return encounters;
    }

    public void setEncounters(List<ProgramEncounterRequest> encounters) {
        this.encounters = encounters;
    }
}