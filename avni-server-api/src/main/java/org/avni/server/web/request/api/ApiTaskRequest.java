package org.avni.server.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.avni.server.web.api.CommonFieldNames;
import org.avni.server.web.contract.TaskFieldNames;
import org.joda.time.DateTime;

import java.util.LinkedHashMap;

public class ApiTaskRequest {
    @JsonProperty(CommonFieldNames.EXTERNAL_ID)
    private String externalId;

    @JsonProperty(CommonFieldNames.VOIDED)
    private boolean voided;

    @JsonProperty(TaskFieldNames.TASK_TYPE)
    private String taskTypeName;

    @JsonProperty(TaskFieldNames.TASK_STATUS)
    private String taskStatus;

    @JsonProperty(TaskFieldNames.NAME)
    private String name;

    @JsonProperty(TaskFieldNames.SCHEDULED_ON)
    private DateTime scheduledOn;

    @JsonProperty(TaskFieldNames.COMPLETED_ON)
    private DateTime completedOn;

    @JsonProperty(TaskFieldNames.ASSIGNED_TO)
    private String assignedTo;

    @JsonProperty(TaskFieldNames.METADATA)
    private LinkedHashMap<String, Object> metadata;

    @JsonProperty(TaskFieldNames.OBSERVATIONS)
    private LinkedHashMap<String, Object> observations;

    @JsonProperty(CommonFieldNames.SUBJECT_EXTERNAL_ID)
    private String subjectExternalId;

    @JsonProperty(CommonFieldNames.SUBJECT_ID)
    private String subjectId;

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }

    public String getTaskTypeName() {
        return taskTypeName;
    }

    public void setTaskTypeName(String taskTypeName) {
        this.taskTypeName = taskTypeName;
    }

    public String getTaskStatus() {
        return taskStatus;
    }

    public void setTaskStatus(String taskStatus) {
        this.taskStatus = taskStatus;
    }

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

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public LinkedHashMap<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(LinkedHashMap<String, Object> metadata) {
        this.metadata = metadata;
    }

    public LinkedHashMap<String, Object> getObservations() {
        return observations;
    }

    public void setObservations(LinkedHashMap<String, Object> observations) {
        this.observations = observations;
    }

    public String getSubjectExternalId() {
        return subjectExternalId;
    }

    public void setSubjectExternalId(String subjectExternalId) {
        this.subjectExternalId = subjectExternalId;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }
}
