package org.openchs.web.request.common;

import org.joda.time.DateTime;
import org.openchs.web.request.CHSRequest;

public class CommonProgramEnrolmentRequest extends CHSRequest {
    private String programUUID;
    private String program;
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

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }
}