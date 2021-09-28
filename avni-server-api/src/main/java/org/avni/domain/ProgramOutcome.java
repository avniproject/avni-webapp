package org.avni.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "program_outcome")
public class ProgramOutcome extends OrganisationAwareEntity {
    @Column
    @NotNull
    private String name;
}
