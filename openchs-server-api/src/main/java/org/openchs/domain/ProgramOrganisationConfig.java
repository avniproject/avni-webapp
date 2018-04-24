package org.openchs.domain;

import org.hibernate.annotations.Type;
import org.openchs.domain.programConfig.VisitScheduleConfig;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity(name = "program_organisation_config")
public class ProgramOrganisationConfig extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @Column
    @Type(type = "visitSchedules")
    private VisitScheduleConfig visitSchedule;


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
}
