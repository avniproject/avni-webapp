package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "program")
public class Program extends OrganisationAwareEntity {
    @NotNull
    @Column
    private String name;

    private String colour;

    @OneToMany(fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            mappedBy = "program")
    private Set<ProgramRule> rules;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }
    public Set<ProgramRule> getRules() {
        if (rules == null) {
            rules = new HashSet<>();
        }
        return rules;
    }

    public void setRules(Set<ProgramRule> rules) {
        this.rules = rules;
    }
}
