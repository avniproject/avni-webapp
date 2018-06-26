package org.openchs.web.request;


import java.util.List;

public class OperationalProgramsContract {
    private String organisationName;
    private List<OperationalProgramContract> operationalPrograms;

    public String getOrganisationName() {
        return organisationName;
    }

    public void setOrganisationName(String organisationName) {
        this.organisationName = organisationName;
    }

    public List<OperationalProgramContract> getOperationalPrograms() {
        return operationalPrograms;
    }

    public void setOperationalPrograms(List<OperationalProgramContract> operationalPrograms) {
        this.operationalPrograms = operationalPrograms;
    }
}
