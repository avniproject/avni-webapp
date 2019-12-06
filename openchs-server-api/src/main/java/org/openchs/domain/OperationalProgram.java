package org.openchs.domain;

import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "operational_program")
public class OperationalProgram extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name="program_id")
    private Program program;

    @Column
    private String name;

    @Column
    private String programSubjectLabel;

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColour() {
        return program.getColour();
    }

    public String getProgramUUID() {
        return program.getUuid();
    }

    public String getProgramName() {
        return program.getName();
    }

    public DateTime getLastModifiedDateTime() {
        return getProgram().getLastModifiedDateTime().isAfter(getAudit().getLastModifiedDateTime()) ? getProgram().getLastModifiedDateTime() : getAudit().getLastModifiedDateTime();
    }

    public void setProgramSubjectLabel(String programSubjectLabel) {
        this.programSubjectLabel = programSubjectLabel;
    }

    public String getProgramSubjectLabel() {
        return programSubjectLabel;
    }

    public String getEnrolmentSummaryRule() {
        return getProgram().getEnrolmentSummaryRule();
    }

    public String getEnrolmentEligibilityCheckRule() {
        return getProgram().getEnrolmentEligibilityCheckRule();
    }

    public String getChecklistsRule() {
        return getProgram().getChecklistsRule();
    }
}