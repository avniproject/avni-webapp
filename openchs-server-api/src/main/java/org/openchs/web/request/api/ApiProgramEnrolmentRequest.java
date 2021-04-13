package org.openchs.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.joda.time.DateTime;
import org.openchs.geo.Point;
import org.openchs.web.api.ProgramEnrolmentFieldNames;

import java.util.LinkedHashMap;

import static org.openchs.web.api.ProgramEnrolmentFieldNames.*;

public class ApiProgramEnrolmentRequest {
    @JsonProperty("Program")
    private String program;

    @JsonProperty(SUBJECT_ID)
    private String subjectUuid;

    @JsonProperty(ENROLMENT_LOCATION)
    private Point enrolmentLocation;

    @JsonProperty(EXIT_LOCATION)
    private Point exitLocation;

    @JsonProperty(ENROLMENT_DATETIME)
    private DateTime enrolmentDateTime;

    @JsonProperty(EXIT_DATETIME)
    private DateTime exitDateTime;

    @JsonProperty("observations")
    private LinkedHashMap<String, Object> observations;

    @JsonProperty(EXIT_OBS)
    private LinkedHashMap<String, Object> exitObservations;

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
}