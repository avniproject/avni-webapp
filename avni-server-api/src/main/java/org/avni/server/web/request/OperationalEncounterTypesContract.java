package org.avni.server.web.request;

import java.util.List;

public class OperationalEncounterTypesContract {

    private List<OperationalEncounterTypeContract> operationalEncounterTypes;

    public List<OperationalEncounterTypeContract> getOperationalEncounterTypes() {
        return operationalEncounterTypes;
    }

    public void setOperationalEncounterTypes(List<OperationalEncounterTypeContract> operationalEncounterTypes) {
        this.operationalEncounterTypes = operationalEncounterTypes;
    }
}
