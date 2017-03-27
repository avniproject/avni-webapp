package org.openchs.web.request;

public class ProgramEncounterRequest extends AbstractEncounterRequest {
    private String programEnrolmentUUID;

    public String getProgramEnrolmentUUID() {
        return programEnrolmentUUID;
    }

    public void setProgramEnrolmentUUID(String programEnrolmentUUID) {
        this.programEnrolmentUUID = programEnrolmentUUID;
    }
}