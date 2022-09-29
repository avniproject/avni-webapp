package org.avni.server.domain;

import org.avni.server.domain.programConfig.VisitScheduleConfig;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;

@Entity(name = "program_organisation_config")
@BatchSize(size = 100)
public class ProgramOrganisationConfig extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "program_id")
    private Program program;

    @Column
    @Type(type = "visitSchedules")
    private VisitScheduleConfig visitSchedule;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "program_organisation_config_at_risk_concept", joinColumns = {@JoinColumn(name = "program_organisation_config_id")}, inverseJoinColumns = {@JoinColumn(name = "concept_id")})
    private Set<Concept> atRiskConcepts = new HashSet<>();

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public VisitScheduleConfig getVisitSchedule() {
        return visitSchedule;
    }

    public void setVisitSchedule(VisitScheduleConfig visitSchedule) {
        this.visitSchedule = visitSchedule;
    }

    public Set<Concept> getAtRiskConcepts() {
        return atRiskConcepts;
    }

    public void setAtRiskConcepts(Set<Concept> atRiskConcepts) {
        this.atRiskConcepts = atRiskConcepts;
    }

    public void addAtRiskConcept(Concept concept) {
        this.atRiskConcepts.add(concept);
    }
}
