package org.avni.web.request.webapp.task;

import org.avni.domain.task.TaskStatus;
import org.avni.web.request.ReferenceDataContract;

public class TaskStatusContract extends ReferenceDataContract {
    private boolean isTerminal;
    private Long taskTypeId;

    public static TaskStatusContract fromEntity(TaskStatus taskStatus) {
        TaskStatusContract taskStatusContract = new TaskStatusContract();
        taskStatusContract.setId(taskStatus.getId());
        taskStatusContract.setUuid(taskStatus.getUuid());
        taskStatusContract.setTerminal(taskStatus.isTerminal());
        taskStatusContract.setName(taskStatus.getName());
        taskStatusContract.setTaskTypeId(taskStatus.getTaskType().getId());
        return taskStatusContract;
    }

    public boolean isTerminal() {
        return isTerminal;
    }

    public void setTerminal(boolean terminal) {
        isTerminal = terminal;
    }

    public Long getTaskTypeId() {
        return taskTypeId;
    }

    public void setTaskTypeId(Long taskTypeId) {
        this.taskTypeId = taskTypeId;
    }
}
