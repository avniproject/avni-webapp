package org.openchs.web.request.common;

import org.joda.time.LocalDate;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.PeriodRequest;

public class CommonIndividualRequest extends CHSRequest {
    private String firstName;

    private String lastName;

    private PeriodRequest age;

    private LocalDate dateOfBirth;
    private boolean dateOfBirthVerified;
    private String genderUUID;
    private String gender;
    // Specify address uuid or specify catchment uuid along with address name
    private String addressLevelUUID;
    private String addressLevel;
    private String catchmentUUID;
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
        if (dateOfBirth != null) return dateOfBirth;
        if (getAge() != null) return getAge().calculateDateOfBirth(this.registrationDate);
        return null;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public PeriodRequest getAge() {
        return age;
    }

    public void setAge(PeriodRequest age) {
        this.age = age;
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

    public String getCatchmentUUID() {
        return catchmentUUID;
    }

    public void setCatchmentUUID(String catchmentUUID) {
        this.catchmentUUID = catchmentUUID;
    }
}