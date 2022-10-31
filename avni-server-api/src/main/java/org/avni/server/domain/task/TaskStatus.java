package org.avni.server.domain.task;

import org.avni.server.domain.OrganisationAwareEntity;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "task_status")
@BatchSize(size = 100)
public class TaskStatus extends OrganisationAwareEntity {
    @Column
    @NotNull
    private String name;

    @Column
    private boolean isTerminal;

    @ManyToOne(targetEntity = TaskType.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "task_type_id")
    @NotNull
    private TaskType taskType;

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

    public TaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(TaskType taskType) {
        this.taskType = taskType;
    }
}
