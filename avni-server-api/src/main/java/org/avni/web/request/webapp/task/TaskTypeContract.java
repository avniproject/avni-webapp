package org.avni.web.request.webapp.task;

import org.avni.domain.task.TaskType;
import org.avni.web.request.ObservationRequest;
import org.avni.web.request.ReferenceDataContract;

import java.util.ArrayList;
import java.util.List;

public class TaskTypeContract extends ReferenceDataContract {
    private String taskTypeName;
    private List<ObservationRequest> metadataSearchFields = new ArrayList<>();

    public String getTaskTypeName() {
        return taskTypeName;
    }

    public void setTaskTypeName(String taskTypeName) {
        this.taskTypeName = taskTypeName;
    }

    public List<ObservationRequest> getMetadataSearchFields() {
        return metadataSearchFields;
    }

    public void setMetadataSearchFields(List<ObservationRequest> metadataSearchFields) {
        this.metadataSearchFields = metadataSearchFields;
    }

    public static TaskTypeContract fromEntity(TaskType taskType) {
        TaskTypeContract taskTypeContract = new TaskTypeContract();
        taskTypeContract.setTaskTypeName(taskType.getType().name());
        taskTypeContract.setName(taskType.getName());
        taskTypeContract.setUuid(taskType.getUuid());
        return taskTypeContract;
    }
}
