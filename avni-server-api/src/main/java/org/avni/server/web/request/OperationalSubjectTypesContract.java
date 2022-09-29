package org.avni.server.web.request;

import java.util.List;

public class OperationalSubjectTypesContract {

    private List<OperationalSubjectTypeContract> operationalSubjectTypes;

    public List<OperationalSubjectTypeContract> getOperationalSubjectTypes() {
        return operationalSubjectTypes;
    }

    public void setOperationalSubjectTypes(List<OperationalSubjectTypeContract> operationalSubjectTypes) {
        this.operationalSubjectTypes = operationalSubjectTypes;
    }
}
