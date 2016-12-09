package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "program_outcome")
public class ProgramOutcome extends CHSEntity {
    @Column
    @NotNull
    private String name;
}