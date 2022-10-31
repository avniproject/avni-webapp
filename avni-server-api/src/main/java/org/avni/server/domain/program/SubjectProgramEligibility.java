package org.avni.server.domain.program;

import org.avni.server.domain.Individual;
import org.avni.server.domain.ObservationCollection;
import org.avni.server.domain.OrganisationAwareEntity;
import org.avni.server.domain.Program;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity(name = "subject_program_eligibility")
public class SubjectProgramEligibility extends OrganisationAwareEntity {
    @ManyToOne(targetEntity = Individual.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    @NotNull
    private Individual subject;

    @ManyToOne(targetEntity = Program.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    @NotNull
    private Program program;

    @Column
    private boolean isEligible;

    @Column
    private DateTime checkDate;

    @Column
    @Type(type = "observations")
    private ObservationCollection observations;

    public Individual getSubject() {
        return subject;
    }

    public void setSubject(Individual subject) {
        this.subject = subject;
    }

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public boolean isEligible() {
        return isEligible;
    }

    public void setEligible(boolean eligible) {
        isEligible = eligible;
    }

    public DateTime getCheckDate() {
        return checkDate;
    }

    public void setCheckDate(DateTime checkDate) {
        this.checkDate = checkDate;
    }

    public ObservationCollection getObservations() {
        return observations;
    }

    public void setObservations(ObservationCollection observations) {
        this.observations = observations;
    }
}
