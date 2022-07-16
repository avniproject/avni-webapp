package org.avni.web.api;

import org.avni.dao.ConceptRepository;
import org.avni.dao.IndividualRepository;
import org.avni.dao.UserRepository;
import org.avni.dao.task.TaskRepository;
import org.avni.dao.task.TaskStatusRepository;
import org.avni.dao.task.TaskTypeRepository;
import org.avni.domain.Individual;
import org.avni.domain.ValidationException;
import org.avni.domain.task.Task;
import org.avni.domain.task.TaskType;
import org.avni.web.request.api.ApiTaskRequest;
import org.avni.web.request.api.RequestUtils;
import org.avni.web.response.SubjectResponse;
import org.avni.web.response.api.ApiTaskResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class TaskApiController {
    private final TaskRepository taskRepository;
    private final TaskTypeRepository taskTypeRepository;
    private final UserRepository userRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final ConceptRepository conceptRepository;
    private final IndividualRepository individualRepository;

    @Autowired
    public TaskApiController(TaskRepository taskRepository, TaskTypeRepository taskTypeRepository, UserRepository userRepository, TaskStatusRepository taskStatusRepository, ConceptRepository conceptRepository, IndividualRepository individualRepository) {
        this.taskRepository = taskRepository;
        this.taskTypeRepository = taskTypeRepository;
        this.userRepository = userRepository;
        this.taskStatusRepository = taskStatusRepository;
        this.conceptRepository = conceptRepository;
        this.individualRepository = individualRepository;
    }

    @PostMapping(value = "/api/task")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity post(@RequestBody ApiTaskRequest request) {
        Task task = new Task();
        TaskType taskType = taskTypeRepository.findByName(request.getTaskTypeName());
        task.setTaskType(taskType);
        task.setAssignedTo(userRepository.findByUsername(request.getAssignedTo()));
        task.setCompletedOn(request.getCompletedOn());
        task.setScheduledOn(request.getScheduledOn());
        task.setLegacyId(request.getExternalId());
        task.setTaskStatus(taskStatusRepository.findByName(request.getTaskStatus()));
        task.setMetadata(RequestUtils.createObservations(request.getMetadata(), conceptRepository));
        task.setObservations(RequestUtils.createObservations(request.getObservations(), conceptRepository));
        task.setName(request.getName());
        Individual individual = individualRepository.getSubject(request.getSubjectId(), request.getSubjectExternalId());
        ApiErrorUtil.throwIfSubjectNotFound(individual, request.getSubjectId(), request.getSubjectExternalId());
        task.setSubject(individual);
        task.setLegacyId(request.getExternalId());
        task.setUuid(UUID.randomUUID().toString());
        task.setVoided(request.isVoided());
        taskRepository.save(task);

        ApiTaskResponse response = new ApiTaskResponse();
        response.setTaskTypeName(task.getTaskType().getName());
        response.setAssignedTo(task.getAssignedTo().getUsername());
        response.setCompletedOn(task.getCompletedOn());
        response.setScheduledOn(task.getScheduledOn());
        response.setExternalId(task.getLegacyId());
        response.setTaskStatus(task.getTaskStatus().getName());
        return null;
    }
}
