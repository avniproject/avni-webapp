package org.avni.server.adapter.contract;

public class ProgramRuleInput {
    private String name;

    public ProgramRuleInput() {
    }

    public ProgramRuleInput(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
