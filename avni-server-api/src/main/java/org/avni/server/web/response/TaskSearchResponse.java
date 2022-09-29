package org.avni.server.web.response;

import org.avni.server.domain.task.Task;
import org.avni.server.util.O;

import java.util.Map;

public class TaskSearchResponse {
    private String name;
    private Long id;
    private String createdOn;
    private String completedOn;
    private String status;
    private String assignedTo;
    private String type;
    private Map<String, Object> metadata;

    public static TaskSearchResponse from(Task task, Map<String, Object> metadataMap) {
        TaskSearchResponse response = new TaskSearchResponse();
        response.setName(task.getName());
        response.setId(task.getId());
        response.setCreatedOn(O.getDateInDbFormat(task.getCreatedDateTime().toDate()));
        if (task.getCompletedOn() != null) {
            response.setCompletedOn(O.getDateInDbFormat(task.getCompletedOn().toDate()));
        }
        if (task.getAssignedTo() != null) {
            response.setAssignedTo(task.getAssignedTo().getName());
        }
        response.setStatus(task.getTaskStatus().getName());
        response.setType(task.getTaskType().getName());
        response.setMetadata(metadataMap);
        return response;
    }

    public String getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(String createdOn) {
        this.createdOn = createdOn;
    }

    public String getCompletedOn() {
        return completedOn;
    }

    public void setCompletedOn(String completedOn) {
        this.completedOn = completedOn;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
