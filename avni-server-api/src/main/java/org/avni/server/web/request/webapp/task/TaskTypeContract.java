package org.avni.server.web.request.webapp.task;

import org.avni.server.domain.Concept;
import org.avni.server.domain.task.TaskType;
import org.avni.server.service.ConceptService;
import org.avni.server.web.request.ReferenceDataContract;

public class TaskTypeContract extends ReferenceDataContract {
    private String taskTypeName;
    private String[] metadataSearchFields;

    public static TaskTypeContract fromEntity(TaskType taskType, ConceptService conceptService) {
        if (taskType == null) return null;
        TaskTypeContract taskTypeContract = fromEntity(taskType);
        String[] metadataSearchFields = taskType.getMetadataSearchFields();
        if (metadataSearchFields != null) {
            String[] searchConcepts = new String[metadataSearchFields.length];
            for (int i = 0; i < metadataSearchFields.length; i++) {
                Concept concept = conceptService.get(metadataSearchFields[i]);
                searchConcepts[i] = concept.getName();
            }
            taskTypeContract.setMetadataSearchFields(searchConcepts);
        }
        return taskTypeContract;
    }

    public static TaskTypeContract fromEntity(TaskType taskType) {
        TaskTypeContract taskTypeContract = new TaskTypeContract();
        taskTypeContract.setTaskTypeName(taskType.getType().name());
        taskTypeContract.setName(taskType.getName());
        taskTypeContract.setUuid(taskType.getUuid());
        taskTypeContract.setId(taskType.getId());
        taskTypeContract.setMetadataSearchFields(taskType.getMetadataSearchFields());
        return taskTypeContract;
    }

    public String getTaskTypeName() {
        return taskTypeName;
    }

    public void setTaskTypeName(String taskTypeName) {
        this.taskTypeName = taskTypeName;
    }

    public String[] getMetadataSearchFields() {
        return metadataSearchFields;
    }

    public void setMetadataSearchFields(String[] metadataSearchFields) {
        this.metadataSearchFields = metadataSearchFields;
    }
}
