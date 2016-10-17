package org.openchs.server.domain;

import org.hibernate.annotations.Type;

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
    private boolean dateOfBirth;

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
}