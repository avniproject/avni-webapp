package org.openchs.domain;

import javax.persistence.*;

@Entity(name = "program_rule")
public class ProgramRule extends OrganisationAwareEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @OneToOne
    @JoinColumn(name = "rule_id")
    private Rule rule;

    public ProgramRule() {}

    public ProgramRule(Program program, Rule rule) {
        this.program = program;
        this.rule = rule;
    }

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public Rule getRule() {
        return rule;
    }

    public void setRule(Rule rule) {
        this.rule = rule;
    }
}
