package org.openchs.web.request.rules.constant;

public enum RuleEnum {
    PROGRAM_ENCOUNTER_RULE("program_encounter_rule"),
    ENCOUNTER_RULE("encounter_rule"),
    PROGRAM_ENROLMENT_RULE("program_enrolment_rule"),
    INDIVIDUAL_RULE("individual_rule");
    private String ruleName;

    public String getRuleName() {
        return ruleName;
    }

    RuleEnum(String ruleName){
        this.ruleName = ruleName;
    }
}
