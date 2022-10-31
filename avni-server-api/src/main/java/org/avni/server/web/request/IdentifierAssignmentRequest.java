package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class IdentifierAssignmentRequest extends CHSRequest {
    private String identifierSourceUUID;
    private String individualUUID;
    private String programEnrolmentUUID;

    public String getIdentifierSourceUUID() {
        return identifierSourceUUID;
    }

    public void setIdentifierSourceUUID(String identifierSourceUUID) {
        this.identifierSourceUUID = identifierSourceUUID;
    }

    public String getIndividualUUID() {
        return individualUUID;
    }

    public void setIndividualUUID(String individualUUID) {
        this.individualUUID = individualUUID;
    }

    public String getProgramEnrolmentUUID() {
        return programEnrolmentUUID;
    }

    public void setProgramEnrolmentUUID(String programEnrolmentUUID) {
        this.programEnrolmentUUID = programEnrolmentUUID;
    }
}
