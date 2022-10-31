package org.avni.server.web.request;

import org.avni.server.domain.OperationalSubjectType;

public class OperationalSubjectTypeContract extends CHSRequest {
    private CHSRequest subjectType;
    private String name;

    public CHSRequest getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(CHSRequest subjectType) {
        this.subjectType = subjectType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public static OperationalSubjectTypeContract fromOperationalSubjectType(OperationalSubjectType operationalSubjectType) {
        OperationalSubjectTypeContract contract = new OperationalSubjectTypeContract();
        contract.setUuid(operationalSubjectType.getUuid());
        contract.setName(operationalSubjectType.getName());
        contract.setSubjectType(new CHSRequest(operationalSubjectType.getSubjectTypeUUID()));
        contract.setVoided(operationalSubjectType.isVoided());
        return contract;
    }
}
