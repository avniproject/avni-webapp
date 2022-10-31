package org.avni.server.web.request.rules.constant;

import java.util.Arrays;

public enum WorkFlowTypeEnum {
    PROGRAM_ENCOUNTER("programencounter"),
    ENCOUNTER("encounter"),
    PROGRAM_ENROLMENT("programenrolment"),
    INDIVIDUAL("individual"),
    PROGRAM_SUMMARY("ProgramSummary"),
    SUBJECT_SUMMARY("SubjectSummary"),
    ENCOUNTER_ELIGIBILITY("ENCOUNTER_ELIGIBILITY");
    private String workFlowTypeName;

    public String getWorkFlowTypeName() {
        return workFlowTypeName;
    }

    WorkFlowTypeEnum(String workFlowTypeName){
        this.workFlowTypeName = workFlowTypeName;
    }

    public static WorkFlowTypeEnum findByValue(String workFlowValue){
        return Arrays.stream(values()).filter(value -> workFlowValue.equals(value.getWorkFlowTypeName().toLowerCase())).findFirst().orElse(null);
    }

    public boolean isSummaryWorkflow() {
        return Arrays.asList(PROGRAM_SUMMARY.workFlowTypeName, SUBJECT_SUMMARY.workFlowTypeName)
                .contains(this.workFlowTypeName);
    }
}
