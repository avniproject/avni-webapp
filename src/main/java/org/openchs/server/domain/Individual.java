package org.openchs.server.domain;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.swing.text.StringContent;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "individuals")
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
    private String gender;
}