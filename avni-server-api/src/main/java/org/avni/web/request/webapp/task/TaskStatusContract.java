package org.avni.web.request.webapp.task;

import org.avni.web.request.ReferenceDataContract;

public class TaskStatusContract extends ReferenceDataContract {
    private boolean isTerminal;
    private int taskTypeId;

    public boolean isTerminal() {
        return isTerminal;
    }

    public void setTerminal(boolean terminal) {
        isTerminal = terminal;
    }

    public int getTaskTypeId() {
        return taskTypeId;
    }

    public void setTaskTypeId(int taskTypeId) {
        this.taskTypeId = taskTypeId;
    }
}
