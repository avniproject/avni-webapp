package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "program_outcome")
@BatchSize(size = 100)
public class ProgramOutcome extends OrganisationAwareEntity {
    @Column
    @NotNull
    private String name;
}
