package org.avni.server.web.request;

import org.avni.server.domain.OperationalProgram;

public class OperationalProgramContract extends CHSRequest {
    private CHSRequest program;
    private String name; /* operationalProgram's Name or in other words alias for a program */
    private String programSubjectLabel;

    public CHSRequest getProgram() {
        return program;
    }

    public void setProgram(CHSRequest program) {
        this.program = program;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setProgramSubjectLabel(String programSubjectLabel) {
        this.programSubjectLabel = programSubjectLabel;
    }

    public String getProgramSubjectLabel() {
        return programSubjectLabel;
    }

    public static OperationalProgramContract fromOperationalProgram(OperationalProgram operationalProgram) {
        OperationalProgramContract contract = new OperationalProgramContract();
        contract.setUuid(operationalProgram.getUuid());
        contract.setName(operationalProgram.getName());
        contract.setProgramSubjectLabel(operationalProgram.getProgramSubjectLabel());
        contract.setProgram(new CHSRequest(operationalProgram.getProgramUUID()));
        contract.setVoided(operationalProgram.isVoided());
        return contract;
    }
}
