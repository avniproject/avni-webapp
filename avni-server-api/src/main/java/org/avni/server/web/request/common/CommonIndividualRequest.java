package org.avni.server.web.request.common;

import org.joda.time.LocalDate;
import org.avni.server.web.request.CHSRequest;
import org.avni.server.web.request.PeriodRequest;
import org.avni.server.web.request.PointRequest;

public class CommonIndividualRequest extends CHSRequest {

    private String subjectTypeUUID;

    private String firstName;

    private String middleName;

    private String lastName;

    private String profilePicture;

    private PeriodRequest age;

    private LocalDate dateOfBirth;
    private boolean dateOfBirthVerified;
    private String genderUUID;
    private String gender;
    // Specify address uuid or specify catchment uuid along with address name
    private String addressLevelUUID;
    private String addressLevel;
    private String addressLevelTypeName;
    private Long addressLevelTypeId;
    private String catchmentUUID;
    private LocalDate registrationDate;
    private PointRequest registrationLocation;
    private String addressLevelLineage;

    public String getFirstName() {
        return firstName;
    }

    public Long getAddressLevelTypeId() {
		return addressLevelTypeId;
	}

	public void setAddressLevelTypeId(Long addressLevelTypeId) {
		this.addressLevelTypeId = addressLevelTypeId;
	}

	public String getAddressLevelTypeName() {
		return addressLevelTypeName;
	}

	public void setAddressLevelTypeName(String addressLevelTypeName) {
		this.addressLevelTypeName = addressLevelTypeName;
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

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
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

    public String getCatchmentUUID() {
        return catchmentUUID;
    }

    public void setCatchmentUUID(String catchmentUUID) {
        this.catchmentUUID = catchmentUUID;
    }

    public PointRequest getRegistrationLocation() {
        return registrationLocation;
    }

    public void setRegistrationLocation(PointRequest registrationLocation) {
        this.registrationLocation = registrationLocation;
    }

    public String getSubjectTypeUUID() {
        return subjectTypeUUID;
    }

    public void setSubjectTypeUUID(String subjectTypeUUID) {
        this.subjectTypeUUID = subjectTypeUUID;
    }

    public String getAddressLevelLineage() {
        return addressLevelLineage;
    }

    public void setAddressLevelLineage(String addressLevelLineage) {
        this.addressLevelLineage = addressLevelLineage;
    }

    public String getMiddleName() {
        return middleName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }
}
