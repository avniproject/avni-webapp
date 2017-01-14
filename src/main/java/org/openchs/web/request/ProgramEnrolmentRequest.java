package org.openchs.web.request;

import org.joda.time.DateTime;

public class ProgramEnrolmentRequest extends CHSRequest {
    private String programUUID;
    private String individualUUID;
    private DateTime enrolmentDateTime;
    private String programOutcomeUUID;
    private DateTime programExitDateTime;

    public String getProgramUUID() {
        return programUUID;
    }

    public void setProgramUUID(String programUUID) {
        this.programUUID = programUUID;
    }

    public String getIndividualUUID() {
        return individualUUID;
    }

    public void setIndividualUUID(String individualUUID) {
        this.individualUUID = individualUUID;
    }

    public DateTime getEnrolmentDateTime() {
        return enrolmentDateTime;
    }

    public void setEnrolmentDateTime(DateTime enrolmentDateTime) {
        this.enrolmentDateTime = enrolmentDateTime;
    }

    public String getProgramOutcomeUUID() {
        return programOutcomeUUID;
    }

    public void setProgramOutcomeUUID(String programOutcomeUUID) {
        this.programOutcomeUUID = programOutcomeUUID;
    }

    public DateTime getProgramExitDateTime() {
        return programExitDateTime;
    }

    public void setProgramExitDateTime(DateTime programExitDateTime) {
        this.programExitDateTime = programExitDateTime;
    }
}