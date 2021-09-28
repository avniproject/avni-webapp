package org.avni.web.request;

import org.avni.domain.Program;

public class ProgramRequest {

    private String name;
    private String uuid;
    private String colour;
    private boolean voided;
    private Boolean active;
    private String enrolmentEligibilityCheckRule;
    private String enrolmentSummaryRule;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    public static ProgramRequest fromProgram(Program program) {
        ProgramRequest programRequest = new ProgramRequest();
        programRequest.setUuid(program.getUuid());
        programRequest.setName(program.getName());
        programRequest.setColour(program.getColour());
        programRequest.setVoided(program.isVoided());
        program.setActive(program.getActive());
        programRequest.setEnrolmentEligibilityCheckRule(program.getEnrolmentEligibilityCheckRule());
        programRequest.setEnrolmentSummaryRule(program.getEnrolmentSummaryRule());
        return programRequest;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }

    public String getEnrolmentEligibilityCheckRule() {
        return enrolmentEligibilityCheckRule;
    }

    public void setEnrolmentEligibilityCheckRule(String enrolmentEligibilityCheckRule) {
        this.enrolmentEligibilityCheckRule = enrolmentEligibilityCheckRule;
    }

    public String getEnrolmentSummaryRule() {
        return enrolmentSummaryRule;
    }

    public void setEnrolmentSummaryRule(String enrolmentSummaryRule) {
        this.enrolmentSummaryRule = enrolmentSummaryRule;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
