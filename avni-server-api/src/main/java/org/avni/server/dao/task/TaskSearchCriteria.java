package org.avni.server.dao.task;

import org.avni.server.domain.Concept;
import org.avni.server.domain.User;
import org.avni.server.domain.task.TaskStatus;
import org.avni.server.domain.task.TaskType;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.HashMap;
import java.util.Map;

public class TaskSearchCriteria {
    public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormat.forPattern("yyyy-MM-dd");

    private TaskType taskType;
    private TaskStatus taskStatus;
    private User assignedTo;
    private DateTime completedOn;
    private DateTime createdOn;
    private Map<Concept, Object> metadata = new HashMap<>();

    public TaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(TaskType taskType) {
        this.taskType = taskType;
    }

    public TaskStatus getTaskStatus() {
        return taskStatus;
    }

    public void setTaskStatus(TaskStatus taskStatus) {
        this.taskStatus = taskStatus;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void addMetadata(Concept concept, Object value) {
        metadata.put(concept, value);
    }

    public Map<Concept, Object> getMetadata() {
        return metadata;
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

    public String getFormattedCreatedOn() {
        return DATE_TIME_FORMATTER.print(createdOn);
    }

    public String getFormattedCompletedOn() {
        return DATE_TIME_FORMATTER.print(completedOn);
    }
}
