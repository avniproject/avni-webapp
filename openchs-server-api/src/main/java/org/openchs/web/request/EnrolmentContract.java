package org.openchs.web.request;

import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class EnrolmentContract extends ReferenceDataContract{
    private String operationalProgramName;

    private DateTime enrolmentDateTime;

    private DateTime programExitDateTime;

    private Set<ProgramEncountersContract> programEncounters = new HashSet<>();

    private List<ObservationContract> observations = new ArrayList<>();

    public List<ObservationContract> getExitObservations() {
        return exitObservations;
    }

    public void setExitObservations(List<ObservationContract> exitObservations) {
        this.exitObservations = exitObservations;
    }

    private List<ObservationContract> exitObservations = new ArrayList<>();

    public List<ObservationContract> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationContract> observations) {
        this.observations = observations;
    }

    public Set<ProgramEncountersContract> getProgramEncounters() {
        return programEncounters;
    }

    public void setProgramEncounters(Set<ProgramEncountersContract> programEncounters) {
        this.programEncounters = programEncounters;
    }

    public String getOperationalProgramName() {
        return operationalProgramName;
    }

    public void setOperationalProgramName(String operationalProgramName) {
        this.operationalProgramName = operationalProgramName;
    }

    public DateTime getEnrolmentDateTime() {
        return enrolmentDateTime;
    }

    public void setEnrolmentDateTime(DateTime enrolmentDateTime) {
        this.enrolmentDateTime = enrolmentDateTime;
    }

    public DateTime getProgramExitDateTime() {
        return programExitDateTime;
    }

    public void setProgramExitDateTime(DateTime programExitDateTime) {
        this.programExitDateTime = programExitDateTime;
    }

}
