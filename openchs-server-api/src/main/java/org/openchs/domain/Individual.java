package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;
import org.joda.time.LocalDate;
import org.openchs.domain.individualRelationship.IndividualRelationship;
import org.openchs.geo.Point;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "individual")
@JsonIgnoreProperties({"programEnrolments", "encounters", "relationships"})
@BatchSize(size = 100)
public class Individual extends OrganisationAwareEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_type_id")
    private SubjectType subjectType;

    @NotNull
    private String firstName;

    private String lastName;

    private LocalDate dateOfBirth;

    private boolean dateOfBirthVerified;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "individuala")
    private Set<IndividualRelationship> relationships = new HashSet<>();

    @NotNull
    private LocalDate registrationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gender_id")
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    @NotNull
    private AddressLevel addressLevel;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "individual")
    private Set<ProgramEnrolment> programEnrolments = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "individual")
    private Set<Encounter> encounters;

    @Column
    @Type(type = "observations")
    private ObservationCollection observations;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id")
    private Facility facility;

    @Type(type = "org.openchs.geo.PointType")
    @Column
    private Point registrationLocation;

    public static Individual create(String firstName, String lastName, LocalDate dateOfBirth, boolean dateOfBirthVerified, Gender gender, AddressLevel address, LocalDate registrationDate) {
        Individual individual = new Individual();
        individual.firstName = firstName;
        individual.lastName = lastName;
        individual.dateOfBirth = dateOfBirth;
        individual.dateOfBirthVerified = dateOfBirthVerified;
        individual.gender = gender;
        individual.addressLevel = address;
        individual.registrationDate = registrationDate;
        return individual;
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

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public Set<ProgramEnrolment> getProgramEnrolments() {
        return programEnrolments;
    }

    public void setProgramEnrolments(Set<ProgramEnrolment> programEnrolments) {
        this.programEnrolments = programEnrolments;
    }

    public AddressLevel getAddressLevel() {
        return addressLevel;
    }

    public void setAddressLevel(AddressLevel addressLevel) {
        this.addressLevel = addressLevel;
    }

    public Set<Encounter> getEncounters() {
        return encounters;
    }

    public void setEncounters(Set<Encounter> encounters) {
        this.encounters = encounters;
    }

    public ObservationCollection getObservations() {
        return observations;
    }

    public void setObservations(ObservationCollection observations) {
        this.observations = observations;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public void addEnrolment(ProgramEnrolment programEnrolment) {
        this.programEnrolments.add(programEnrolment);
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

    public Facility getFacility() {
        return facility;
    }

    public void setFacility(Facility facility) {
        this.facility = facility;
    }

    public Point getRegistrationLocation() {
        return registrationLocation;
    }

    public void setRegistrationLocation(Point registrationLocation) {
        this.registrationLocation = registrationLocation;
    }

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }

    public Set<IndividualRelationship> getRelationships() {
        return relationships;
    }

    public void setRelationships(Set<IndividualRelationship> relationships) {
        this.relationships = relationships;
    }

    @JsonIgnore
    public List<Program> getActivePrograms() {
        return programEnrolments.stream().filter(x -> !x.isVoided()).filter(x -> x.getProgramExitDateTime() == null)
                .map(x -> x.getProgram()).collect(Collectors.toList());
    }

}
