package org.avni.server.web.request;


import java.util.List;

public class OperationalProgramsContract {

    private List<OperationalProgramContract> operationalPrograms;

    public List<OperationalProgramContract> getOperationalPrograms() {
        return operationalPrograms;
    }

    public void setOperationalPrograms(List<OperationalProgramContract> operationalPrograms) {
        this.operationalPrograms = operationalPrograms;
    }
}
