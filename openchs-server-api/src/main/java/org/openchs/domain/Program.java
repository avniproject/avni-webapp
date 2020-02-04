package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.openchs.application.projections.BaseProjection;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "program")
@JsonIgnoreProperties({"operationalPrograms"})
public class Program extends OrganisationAwareEntity {
    @NotNull
    @Column
    private String name;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "program")
    private Set<OperationalProgram> operationalPrograms = new HashSet<>();

    private String colour;

    @Column(name = "enrolment_summary_rule")
    private String enrolmentSummaryRule;

    @Column(name = "enrolment_eligibility_check_rule")
    private String enrolmentEligibilityCheckRule;

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

    public Set<OperationalProgram> getOperationalPrograms() {
        return operationalPrograms;
    }

    public void setOperationalPrograms(Set<OperationalProgram> operationalPrograms) {
        this.operationalPrograms = operationalPrograms;
    }

    @JsonIgnore
    public String getOperationalProgramName() {
        return operationalPrograms.stream()
                .map(OperationalProgram::getName)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(name);
    }

    @JsonIgnore
    public String getProgramSubjectLabel() {
        return operationalPrograms
                .stream()
                .map(OperationalProgram::getProgramSubjectLabel)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(getOperationalProgramName());
    }

    public String getEnrolmentSummaryRule() {
        return enrolmentSummaryRule;
    }

    public void setEnrolmentSummaryRule(String enrolmentSummaryRule) {
        this.enrolmentSummaryRule = enrolmentSummaryRule;
    }

    public String getEnrolmentEligibilityCheckRule() {
        return enrolmentEligibilityCheckRule;
    }

    public void setEnrolmentEligibilityCheckRule(String enrolmentEligibilityCheckRule) {
        this.enrolmentEligibilityCheckRule = enrolmentEligibilityCheckRule;
    }


    @Projection(name = "ProgramProjection", types = {Program.class})
    public interface ProgramProjection extends BaseProjection {
        String getName();

        String getColour();

        String getOperationalProgramName();

        String getProgramSubjectLabel();
    }
}
