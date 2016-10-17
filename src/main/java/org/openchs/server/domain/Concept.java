package org.openchs.server.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "concept")
public class Concept extends CHSEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @NotNull
    private String name;

    @NotNull
    private String uuid;

    @NotNull
    private String dataType;

    private double lowAbsolute;
    private double highAbsolute;
    private double lowNormal;
    private double highNormal;
}