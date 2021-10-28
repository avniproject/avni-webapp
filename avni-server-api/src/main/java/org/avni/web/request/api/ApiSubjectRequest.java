package org.avni.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.avni.geo.Point;
import org.joda.time.LocalDate;

import java.util.LinkedHashMap;

import static org.avni.web.api.CommonFieldNames.VOIDED;

public class ApiSubjectRequest {

    @JsonProperty("Subject type")
    private String subjectType;

    @JsonProperty("Address")
    private String address;

    @JsonProperty("Date of birth")
    private LocalDate dateOfBirth;

    @JsonProperty("Gender")
    private String gender;

    @JsonProperty("Registration date")
    private LocalDate registrationDate;

    @JsonProperty("First name")
    private String firstName;

    @JsonProperty("Last name")
    private String lastName;

    @JsonProperty("Registration location")
    private Point registrationLocation;

    @JsonProperty("observations")
    private LinkedHashMap<String, Object> observations;

    @JsonProperty(VOIDED)
    private boolean voided;

    public String getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(String subjectType) {
        this.subjectType = subjectType;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Point getRegistrationLocation() {
        return registrationLocation;
    }

    public void setRegistrationLocation(Point registrationLocation) {
        this.registrationLocation = registrationLocation;
    }

    public LinkedHashMap<String, Object> getObservations() {
        return observations;
    }

    public void setObservations(LinkedHashMap<String, Object> observations) {
        this.observations = observations;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }
}
