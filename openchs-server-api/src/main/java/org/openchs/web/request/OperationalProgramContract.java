package org.openchs.web.request;

public class OperationalProgramContract extends CHSRequest {
    private CHSRequest program;
    private String name; /* operationalProgram's Name or in other words alias for a program */
    private String programRegistrationLabel;

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

    public void setProgramRegistrationLabel(String programRegistrationLabel) {
        this.programRegistrationLabel = programRegistrationLabel;
    }

    public String getProgramRegistrationLabel() {
        return programRegistrationLabel;
    }
}
