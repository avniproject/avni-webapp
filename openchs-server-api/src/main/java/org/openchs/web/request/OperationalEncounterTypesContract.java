package org.openchs.web.request;

import java.util.List;

public class OperationalEncounterTypesContract {
    private String organisationName;
    private List<OperationalEncounterTypeContract> operationalEncounterTypes;

    public String getOrganisationName() {
        return organisationName;
    }

    public void setOrganisationName(String organisationName) {
        this.organisationName = organisationName;
    }

    public List<OperationalEncounterTypeContract> getOperationalEncounterTypes() {
        return operationalEncounterTypes;
    }

    public void setOperationalEncounterTypes(List<OperationalEncounterTypeContract> operationalEncounterTypes) {
        this.operationalEncounterTypes = operationalEncounterTypes;
    }
}
