package org.openchs.server.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.annotations.Type;
import org.joda.time.LocalDate;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "individual")
public class Individual extends CHSEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @NotNull
    private String name;

    @NotNull
    private LocalDate dateOfBirth;

    @NotNull
    private boolean dateOfBirthEstimated;

    @NotNull
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="gender_id")
    private Gender gender;

    @Column
    private long catchment_id;

    @Column
    @Type(type = "JsonbType")
    private KeyValuePairs profile;

    @Column
    @Type(type = "JsonbType")
    private KeyValuePairs address;

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

    public long getCatchment_id() {
        return catchment_id;
    }

    public void setCatchment_id(long catchment_id) {
        this.catchment_id = catchment_id;
    }

    public KeyValuePairs getProfile() {
        return profile;
    }

    public void setProfile(KeyValuePairs profile) {
        this.profile = profile;
    }

    public KeyValuePairs getAddress() {
        return address;
    }

    public void setAddress(KeyValuePairs address) {
        this.address = address;
    }

    public static Individual create(String name, LocalDate dateOfBirth, boolean dateOfBirthEstimated, Gender gender) {
        Individual individual = new Individual();
        individual.name = name;
        individual.dateOfBirth = dateOfBirth;
        individual.dateOfBirthEstimated = dateOfBirthEstimated;
        individual.gender = gender;
        return individual;
    }
}