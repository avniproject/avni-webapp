package org.openchs.web.request;

import java.util.List;

public class OperationalSubjectTypesContract {
    private String organisationUUID;
    private List<OperationalSubjectTypeContract> operationalSubjectTypes;

    public String getOrganisationUUID() {
        return organisationUUID;
    }

    public void setOrganisationUUID(String organisationUUID) {
        this.organisationUUID = organisationUUID;
    }

    public List<OperationalSubjectTypeContract> getOperationalSubjectTypes() {
        return operationalSubjectTypes;
    }

    public void setOperationalSubjectTypes(List<OperationalSubjectTypeContract> operationalSubjectTypes) {
        this.operationalSubjectTypes = operationalSubjectTypes;
    }
}
