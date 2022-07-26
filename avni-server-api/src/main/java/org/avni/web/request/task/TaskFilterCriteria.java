package org.avni.web.request.task;

import org.avni.web.request.ObservationRequest;

import java.util.ArrayList;
import java.util.List;

public class TaskFilterCriteria {
    private long taskType;
    private long taskStatus;
    private long assignedTo;
    private List<ObservationRequest> metadata = new ArrayList<>();

    public long getTaskType() {
        return taskType;
    }

    public void setTaskType(long taskType) {
        this.taskType = taskType;
    }

    public long getTaskStatus() {
        return taskStatus;
    }

    public void setTaskStatus(long taskStatus) {
        this.taskStatus = taskStatus;
    }

    public long getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(long assignedTo) {
        this.assignedTo = assignedTo;
    }

    public List<ObservationRequest> getMetadata() {
        return metadata;
    }

    public void setMetadata(List<ObservationRequest> metadata) {
        this.metadata = metadata;
    }
}
