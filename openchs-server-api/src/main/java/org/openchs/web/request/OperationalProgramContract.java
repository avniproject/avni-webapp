package org.openchs.web.request;

public class OperationalProgramContract extends CHSRequest {
    private CHSRequest program;
    private String name; /* operationalProgram's Name or in other words alias for a program */

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
}
