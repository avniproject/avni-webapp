package org.avni.server.web.request.webapp.task;

import org.avni.server.domain.task.TaskStatus;
import org.avni.server.web.request.ReferenceDataContract;

public class TaskStatusContract extends ReferenceDataContract {
    private boolean isTerminal;
    private Long taskTypeId;
    private String taskTypeUUID;

    public static TaskStatusContract fromEntity(TaskStatus taskStatus) {
        TaskStatusContract taskStatusContract = new TaskStatusContract();
        taskStatusContract.setId(taskStatus.getId());
        taskStatusContract.setUuid(taskStatus.getUuid());
        taskStatusContract.setTerminal(taskStatus.isTerminal());
        taskStatusContract.setName(taskStatus.getName());
        taskStatusContract.setTaskTypeId(taskStatus.getTaskType().getId());
        taskStatusContract.setTaskTypeUUID(taskStatus.getTaskType().getUuid());
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

    public String getTaskTypeUUID() {
        return taskTypeUUID;
    }

    public void setTaskTypeUUID(String taskTypeUUID) {
        this.taskTypeUUID = taskTypeUUID;
    }
}
