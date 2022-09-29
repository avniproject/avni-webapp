package org.avni.server.web.request;

import org.joda.time.DateTime;

import java.util.List;

public class TaskRequest extends CHSRequest {
    private String name;
    private DateTime scheduledOn;
    private DateTime completedOn;
    private List<ObservationRequest> metadata;
    private List<ObservationRequest> observations;
    private String taskTypeUUID;
    private String taskStatusUUID;
    private String subjectUUID;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DateTime getScheduledOn() {
        return scheduledOn;
    }

    public void setScheduledOn(DateTime scheduledOn) {
        this.scheduledOn = scheduledOn;
    }

    public DateTime getCompletedOn() {
        return completedOn;
    }

    public void setCompletedOn(DateTime completedOn) {
        this.completedOn = completedOn;
    }

    public List<ObservationRequest> getMetadata() {
        return metadata;
    }

    public void setMetadata(List<ObservationRequest> metadata) {
        this.metadata = metadata;
    }

    public List<ObservationRequest> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequest> observations) {
        this.observations = observations;
    }

    public String getTaskTypeUUID() {
        return taskTypeUUID;
    }

    public void setTaskTypeUUID(String taskTypeUUID) {
        this.taskTypeUUID = taskTypeUUID;
    }

    public String getTaskStatusUUID() {
        return taskStatusUUID;
    }

    public void setTaskStatusUUID(String taskStatusUUID) {
        this.taskStatusUUID = taskStatusUUID;
    }

    public String getSubjectUUID() {
        return subjectUUID;
    }

    public void setSubjectUUID(String subjectUUID) {
        this.subjectUUID = subjectUUID;
    }
}
