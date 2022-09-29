package org.avni.server.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.avni.server.geo.Point;
import org.avni.server.web.api.CommonFieldNames;
import org.joda.time.LocalDate;

import java.util.LinkedHashMap;

public class ApiSubjectRequest {
    @JsonProperty(CommonFieldNames.EXTERNAL_ID)
    private String externalId;

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

    @JsonProperty("Middle name")
    private String middleName;

    @JsonProperty("Last name")
    private String lastName;

    @JsonProperty("Profile picture")
    private String profilePicture;

    @JsonProperty("Registration location")
    private Point registrationLocation;

    @JsonProperty("observations")
    private LinkedHashMap<String, Object> observations;

    @JsonProperty(CommonFieldNames.VOIDED)
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

    public String getMiddleName() {
        return middleName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
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

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }
}
