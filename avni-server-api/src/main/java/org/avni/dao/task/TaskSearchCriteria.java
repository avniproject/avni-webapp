package org.avni.dao.task;

import org.avni.domain.Concept;
import org.avni.domain.User;
import org.avni.domain.task.TaskStatus;
import org.avni.domain.task.TaskType;

import java.util.HashMap;
import java.util.Map;

public class TaskSearchCriteria {
    private TaskType taskType;
    private TaskStatus taskStatus;
    private User assignedTo;
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
}
