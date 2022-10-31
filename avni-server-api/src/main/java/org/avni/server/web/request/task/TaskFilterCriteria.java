package org.avni.server.web.request.task;

import org.avni.server.web.request.ObservationRequest;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;

public class TaskFilterCriteria {
    private long taskType;
    private long taskStatus;
    private Long assignedTo;
    private DateTime completedOn;
    private DateTime createdOn;
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

    public Long getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }

    public List<ObservationRequest> getMetadata() {
        return metadata;
    }

    public void setMetadata(List<ObservationRequest> metadata) {
        this.metadata = metadata;
    }

    public DateTime getCompletedOn() {
        return completedOn;
    }

    public void setCompletedOn(DateTime completedOn) {
        this.completedOn = completedOn;
    }

    public DateTime getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(DateTime createdOn) {
        this.createdOn = createdOn;
    }

    public boolean isUnassigned() {
        return assignedTo != null && assignedTo == 0;
    }
}
