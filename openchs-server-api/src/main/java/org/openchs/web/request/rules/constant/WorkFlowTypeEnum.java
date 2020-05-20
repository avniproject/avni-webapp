package org.openchs.web.request.rules.constant;

import java.util.Arrays;

public enum WorkFlowTypeEnum {
    PROGRAM_ENCOUNTER("programencounter"),
    ENCOUNTER("encounter"),
    PROGRAM_ENROLMENT("programenrolment"),
    INDIVIDUAL("individual");
    private String workFlowTypeName;

    public String getWorkFlowTypeName() {
        return workFlowTypeName;
    }

    WorkFlowTypeEnum(String workFlowTypeName){
        this.workFlowTypeName = workFlowTypeName;
    }

    public static WorkFlowTypeEnum findByValue(String workFlowValue){
        return Arrays.stream(values()).filter(value -> workFlowValue.equals(value.getWorkFlowTypeName())).findFirst().orElse(null);
    }
}
