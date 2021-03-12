package org.openchs.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.joda.time.DateTime;
import org.openchs.geo.Point;

import java.util.LinkedHashMap;

public class ApiProgramEnrolmentRequest {
    @JsonProperty("Program")
    private String program;

    @JsonProperty("Subject ID")
    private String subjectUuid;

    @JsonProperty("Enrolment location")
    private Point enrolmentLocation;

    @JsonProperty("Exit location")
    private Point exitLocation;

    @JsonProperty("Enrolment date time")
    private DateTime enrolmentDateTime;

    @JsonProperty("Exit date time")
    private DateTime exitDateTime;

    @JsonProperty("observations")
    private LinkedHashMap<String, Object> observations;

    @JsonProperty("exitObservations")
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