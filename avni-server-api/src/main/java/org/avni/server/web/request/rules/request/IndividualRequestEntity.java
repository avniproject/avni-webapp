package org.avni.server.web.request.rules.request;

import org.joda.time.LocalDate;

import java.util.List;

public class IndividualRequestEntity {
    private String uuid;

    private String firstName;

    private String lastName;

    private String profilePicture;

    private boolean voided;

    private LocalDate dateOfBirth;

    private LocalDate registrationDate;

    private String genderUUID;

    private String addressLevelUUID;

    private String subjectTypeUUID;

    private List<ObservationRequestEntity> observations;

    public void setUuid(String uuid){
        this.uuid = uuid;
    }
    public String getUuid(){
        return this.uuid;
    }
    public void setFirstName(String firstName){
        this.firstName = firstName;
    }
    public String getFirstName(){
        return this.firstName;
    }
    public void setLastName(String lastName){
        this.lastName = lastName;
    }
    public String getLastName(){
        return this.lastName;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public void setVoided(boolean voided){
        this.voided = voided;
    }
    public boolean getVoided(){
        return this.voided;
    }
    public void setDateOfBirth(LocalDate dateOfBirth){
        this.dateOfBirth = dateOfBirth;
    }
    public LocalDate getDateOfBirth(){
        return this.dateOfBirth;
    }
    public void setRegistrationDate(LocalDate registrationDate){
        this.registrationDate = registrationDate;
    }
    public LocalDate getRegistrationDate(){
        return this.registrationDate;
    }
    public void setGenderUUID(String genderUUID){
        this.genderUUID = genderUUID;
    }
    public String getGenderUUID(){
        return this.genderUUID;
    }
    public void setAddressLevelUUID(String addressLevelUUID){
        this.addressLevelUUID = addressLevelUUID;
    }
    public String getAddressLevelUUID(){
        return this.addressLevelUUID;
    }
    public void setSubjectTypeUUID(String subjectTypeUUID){
        this.subjectTypeUUID = subjectTypeUUID;
    }
    public String getSubjectTypeUUID(){
        return this.subjectTypeUUID;
    }
    public void setObservations(List<ObservationRequestEntity> observations){
        this.observations = observations;
    }
    public List<ObservationRequestEntity> getObservations(){
        return this.observations;
    }

    public boolean isVoided() {
        return voided;
    }
}
