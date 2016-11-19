package org.openchs.domain;

import org.joda.time.LocalDate;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Entity
@Table(name = "individual")
public class Individual extends CHSEntity {
    @NotNull
    private String name;

    @NotNull
    private LocalDate dateOfBirth;

    @NotNull
    private boolean dateOfBirthEstimated;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gender_id")
    private Gender gender;

    @Column(name = "catchment_id")
    private long catchmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private AddressLevel addressLevel;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProgramEnrolment> programEnrolments;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public boolean isDateOfBirthEstimated() {
        return dateOfBirthEstimated;
    }

    public void setDateOfBirthEstimated(boolean dateOfBirthEstimated) {
        this.dateOfBirthEstimated = dateOfBirthEstimated;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public long getCatchmentId() {
        return catchmentId;
    }

    public void setCatchmentId(long catchmentId) {
        this.catchmentId = catchmentId;
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

    public static Individual create(String name, LocalDate dateOfBirth, boolean dateOfBirthEstimated, Gender gender, AddressLevel address) {
        Individual individual = new Individual();
        individual.name = name;
        individual.dateOfBirth = dateOfBirth;
        individual.dateOfBirthEstimated = dateOfBirthEstimated;
        individual.gender = gender;
        individual.addressLevel = address;
        return individual;
    }
}