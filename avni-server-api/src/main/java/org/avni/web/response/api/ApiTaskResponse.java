package org.avni.web.response.api;

import org.avni.dao.ConceptRepository;
import org.avni.domain.task.Task;
import org.avni.service.ConceptService;
import org.avni.web.response.Response;

import java.util.LinkedHashMap;

import static org.avni.web.api.CommonFieldNames.*;
import static org.avni.web.contract.TaskFieldNames.*;
import static org.avni.web.contract.TaskFieldNames.NAME;

public class ApiTaskResponse extends LinkedHashMap<String, Object> {

    public static ApiTaskResponse fromTask(Task task, ConceptRepository conceptRepository, ConceptService conceptService) {
        ApiTaskResponse response = new ApiTaskResponse();
        response.put(TASK_TYPE, task.getTaskType().getName());
        if (task.getAssignedTo() != null) {
            response.put(ASSIGNED_TO, task.getAssignedTo().getUsername());
        }
        response.put(COMPLETED_ON, task.getCompletedOn());
        response.put(SCHEDULED_ON, task.getScheduledOn());
        response.put(EXTERNAL_ID, task.getLegacyId());
        response.put(TASK_STATUS, task.getTaskStatus().getName());
        Response.putObservations(conceptRepository, conceptService, response, new LinkedHashMap<>(), task.getMetadata(), METADATA);
        Response.putObservations(conceptRepository, conceptService, response, new LinkedHashMap<>(), task.getObservations(), OBSERVATIONS);
        response.put(NAME, task.getName());
        if (task.getSubject() != null) {
            response.put(SUBJECT_ID, task.getSubject().getUuid());
            response.put(SUBJECT_EXTERNAL_ID, task.getSubject().getLegacyId());
        }
        response.put(ID, task.getUuid());
        response.put(VOIDED, task.isVoided());
        return response;
    }
}
