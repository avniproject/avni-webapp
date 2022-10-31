package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "operational_program")
@BatchSize(size = 100)
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
        return getProgram().getLastModifiedDateTime().isAfter(super.getLastModifiedDateTime()) ? getProgram().getLastModifiedDateTime() : super.getLastModifiedDateTime();
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

    public boolean getActive() {
        return getProgram().getActive();
    }

    public boolean getProgramVoided(){
        return getProgram().isVoided();
    }

    public DeclarativeRule getEnrolmentEligibilityCheckDeclarativeRule() {
        return getProgram().getEnrolmentEligibilityCheckDeclarativeRule();
    }

    public String getManualEnrolmentEligibilityCheckRule() {
        return program.getManualEnrolmentEligibilityCheckRule();
    }

    public DeclarativeRule getManualEnrolmentEligibilityCheckDeclarativeRule() {
        return program.getManualEnrolmentEligibilityCheckDeclarativeRule();
    }

    public boolean isManualEligibilityCheckRequired() {
        return program.isManualEligibilityCheckRequired();
    }
}
