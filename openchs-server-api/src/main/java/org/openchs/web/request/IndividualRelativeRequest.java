package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.DateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class IndividualRelativeRequest extends CHSRequest {

    private String relationUUID;
    private String individualUUID;
    private String relativeIndividualUUID;
    private DateTime enterDateTime;
    private DateTime exitDateTime;


    public String getRelationUUID() {
        return relationUUID;
    }

    public void setRelationUUID(String relationUUID) {
        this.relationUUID = relationUUID;
    }

    public String getIndividualUUID() {
        return individualUUID;
    }

    public void setIndividualUUID(String individualUUID) {
        this.individualUUID = individualUUID;
    }

    public String getRelativeIndividualUUID() {
        return relativeIndividualUUID;
    }

    public void setRelativeIndividualUUID(String relativeIndividualUUID) {
        this.relativeIndividualUUID = relativeIndividualUUID;
    }

    public DateTime getEnterDateTime() {
        return enterDateTime;
    }

    public void setEnterDateTime(DateTime enterDateTime) {
        this.enterDateTime = enterDateTime;
    }

    public DateTime getExitDateTime() {
        return exitDateTime;
    }

    public void setExitDateTime(DateTime exitDateTime) {
        this.exitDateTime = exitDateTime;
    }
}