package org.openchs.web.request.common;

import org.joda.time.LocalDate;
import org.openchs.web.request.CHSRequest;

public class CommonIndividualRequest extends CHSRequest {
    private String firstName;

    private String lastName;

    private LocalDate dateOfBirth;
    private boolean dateOfBirthVerified;
    private String genderUUID;
    private String gender;
    private String addressLevelUUID;
    private String addressLevel;
    private LocalDate registrationDate;
    private boolean isVoided = false;

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

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public boolean isDateOfBirthVerified() {
        return dateOfBirthVerified;
    }

    public void setDateOfBirthVerified(boolean dateOfBirthVerified) {
        this.dateOfBirthVerified = dateOfBirthVerified;
    }

    public String getGenderUUID() {
        return genderUUID;
    }

    public void setGenderUUID(String genderUUID) {
        this.genderUUID = genderUUID;
    }

    public String getAddressLevelUUID() {
        return addressLevelUUID;
    }

    public void setAddressLevelUUID(String addressLevelUUID) {
        this.addressLevelUUID = addressLevelUUID;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAddressLevel() {
        return addressLevel;
    }

    public void setAddressLevel(String addressLevel) {
        this.addressLevel = addressLevel;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        this.isVoided = voided;
    }
}