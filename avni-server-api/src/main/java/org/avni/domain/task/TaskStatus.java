package org.avni.domain.task;

import org.avni.domain.OrganisationAwareEntity;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "task_type")
@BatchSize(size = 100)
public class TaskStatus extends OrganisationAwareEntity {
    @Column
    @NotNull
    private String name;

    @Column
    private boolean isTerminal;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isTerminal() {
        return isTerminal;
    }

    public void setTerminal(boolean terminal) {
        isTerminal = terminal;
    }
}
