package org.avni.domain.program;

import org.avni.domain.Individual;
import org.avni.domain.OrganisationAwareEntity;
import org.avni.domain.Program;
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
}
