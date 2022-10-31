package org.avni.server.web.request.rules.request;

import org.joda.time.DateTime;

import java.util.List;

public class ProgramEnrolmentRequestEntity {
    private String uuid;

    private boolean voided;

    private String programUUID;

    private DateTime enrolmentDateTime;

    private DateTime programExitDateTime;

    private String programOutcomeUUID;

    private String individualUUID;

    private List<ObservationRequestEntity> observations;

    private List<ObservationRequestEntity> programExitObservations;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }

    public String getProgramUUID() {
        return programUUID;
    }

    public void setProgramUUID(String programUUID) {
        this.programUUID = programUUID;
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

    public String getProgramOutcomeUUID() {
        return programOutcomeUUID;
    }

    public void setProgramOutcomeUUID(String programOutcomeUUID) {
        this.programOutcomeUUID = programOutcomeUUID;
    }

    public String getIndividualUUID() {
        return individualUUID;
    }

    public void setIndividualUUID(String individualUUID) {
        this.individualUUID = individualUUID;
    }

    public List<ObservationRequestEntity> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequestEntity> observations) {
        this.observations = observations;
    }

    public List<ObservationRequestEntity> getProgramExitObservations() {
        return programExitObservations;
    }

    public void setProgramExitObservations(List<ObservationRequestEntity> programExitObservations) {
        this.programExitObservations = programExitObservations;
    }
}
