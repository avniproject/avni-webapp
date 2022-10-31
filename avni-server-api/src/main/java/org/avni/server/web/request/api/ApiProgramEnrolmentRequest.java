package org.avni.server.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.avni.server.web.api.CommonFieldNames;
import org.avni.server.web.api.ProgramEnrolmentFieldNames;
import org.joda.time.DateTime;
import org.avni.server.geo.Point;

import java.util.LinkedHashMap;

public class ApiProgramEnrolmentRequest {
    @JsonProperty("External ID")
    private String externalId;

    @JsonProperty("Program")
    private String program;

    @JsonProperty("Subject external ID")
    private String subjectExternalId;

    @JsonProperty(CommonFieldNames.SUBJECT_ID)
    private String subjectUuid;

    @JsonProperty(ProgramEnrolmentFieldNames.ENROLMENT_LOCATION)
    private Point enrolmentLocation;

    @JsonProperty(ProgramEnrolmentFieldNames.EXIT_LOCATION)
    private Point exitLocation;

    @JsonProperty(ProgramEnrolmentFieldNames.ENROLMENT_DATETIME)
    private DateTime enrolmentDateTime;

    @JsonProperty(ProgramEnrolmentFieldNames.EXIT_DATETIME)
    private DateTime exitDateTime;

    @JsonProperty("observations")
    private LinkedHashMap<String, Object> observations;

    @JsonProperty(ProgramEnrolmentFieldNames.EXIT_OBS)
    private LinkedHashMap<String, Object> exitObservations;

    @JsonProperty(CommonFieldNames.VOIDED)
    private boolean isVoided;

    public String getProgram() {
        return program;
    }

    public String getSubjectUuid() {
        return subjectUuid;
    }

    public Point getEnrolmentLocation() {
        return enrolmentLocation;
    }

    public Point getExitLocation() {
        return exitLocation;
    }

    public DateTime getEnrolmentDateTime() {
        return enrolmentDateTime;
    }

    public DateTime getExitDateTime() {
        return exitDateTime;
    }

    public LinkedHashMap<String, Object> getObservations() {
        return observations;
    }

    public LinkedHashMap<String, Object> getExitObservations() {
        return exitObservations;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public String getExternalId() {
        return externalId;
    }

    public String getSubjectExternalId() {
        return subjectExternalId;
    }
}
