package org.avni.server.web.api;

import org.avni.server.application.KeyType;
import org.avni.server.application.KeyValues;
import org.avni.server.application.ValueType;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.dao.task.TaskRepository;
import org.avni.server.dao.task.TaskStatusRepository;
import org.avni.server.dao.task.TaskTypeRepository;
import org.avni.server.domain.Concept;
import org.avni.server.domain.Individual;
import org.avni.server.domain.ObservationCollection;
import org.avni.server.domain.task.Task;
import org.avni.server.domain.task.TaskStatus;
import org.avni.server.domain.task.TaskType;
import org.avni.server.domain.task.TaskTypeName;
import org.avni.server.service.ConceptService;
import org.avni.server.web.request.api.RequestUtils;
import org.avni.server.web.response.ResponsePage;
import org.avni.server.web.response.api.ApiTaskResponse;
import org.avni.server.web.request.api.ApiTaskRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;

@RestController
public class TaskApiController {
    private final TaskRepository taskRepository;
    private final TaskTypeRepository taskTypeRepository;
    private final UserRepository userRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final ConceptRepository conceptRepository;
    private final IndividualRepository individualRepository;
    private final ConceptService conceptService;

    @Autowired
    public TaskApiController(TaskRepository taskRepository, TaskTypeRepository taskTypeRepository, UserRepository userRepository, TaskStatusRepository taskStatusRepository, ConceptRepository conceptRepository, IndividualRepository individualRepository, ConceptService conceptService) {
        this.taskRepository = taskRepository;
        this.taskTypeRepository = taskTypeRepository;
        this.userRepository = userRepository;
        this.taskStatusRepository = taskStatusRepository;
        this.conceptRepository = conceptRepository;
        this.individualRepository = individualRepository;
        this.conceptService = conceptService;
    }

    @PostMapping(value = "/api/task")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity post(@RequestBody ApiTaskRequest request) {
        Task task = createTask(request.getExternalId());
        TaskType taskType = taskTypeRepository.findByName(request.getTaskTypeName());
        if (taskType == null) {
            throw new IllegalArgumentException(String.format("Task type not found with name '%s'", request.getTaskTypeName()));
        }
        TaskStatus taskStatus = taskStatusRepository.findByNameAndTaskType(request.getTaskStatus(), taskType);
        if (taskStatus == null) {
            throw new IllegalArgumentException(String.format("Task status not found with name '%s'", request.getTaskStatus()));
        }
        task.setTaskStatus(taskStatus);
        task.setTaskType(taskType);
        task.setAssignedTo(userRepository.findByUsername(request.getAssignedTo()));
        task.setCompletedOn(request.getCompletedOn());
        task.setScheduledOn(request.getScheduledOn());
        task.setLegacyId(request.getExternalId());
        ObservationCollection metadata = RequestUtils.createObservations(request.getMetadata(), conceptRepository);
        if (taskType.getType().equals(TaskTypeName.Call)) {
            boolean hasAtLeastOneMobileNumberValue = metadata.entrySet().stream().anyMatch(entrySet -> {
                Concept concept = conceptRepository.findByUuid(entrySet.getKey());
                KeyValues keyValues = concept.getKeyValues();
                ValueType[] valueTypes = {ValueType.yes};
                return keyValues != null && (keyValues.containsOneOfTheValues(KeyType.contact_number, valueTypes) ||
                        keyValues.containsOneOfTheValues(KeyType.primary_contact, valueTypes));
            });
            if (!hasAtLeastOneMobileNumberValue) {
                throw new RuntimeException("Call type task cannot be saved without mobile number. If you have provided the mobile number please contact support.");
            }
        }
        task.setMetadata(metadata);
        task.setObservations(RequestUtils.createObservations(request.getObservations(), conceptRepository));
        task.setName(request.getName());
        Individual individual = individualRepository.getSubject(request.getSubjectId(), request.getSubjectExternalId());
        task.setSubject(individual);
        task.setLegacyId(request.getExternalId());
        task.assignUUID();
        task.setVoided(request.isVoided());
        taskRepository.save(task);
        return new ResponseEntity<>(ApiTaskResponse.fromTask(task, conceptRepository, conceptService), HttpStatus.OK);
    }

    @RequestMapping(value = "/api/tasks", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponsePage getSubjects(@RequestParam(value = "type") String type,
                                    @RequestParam(value = "isTerminalStatus") boolean isTerminalStatus,
                                    @RequestParam(value = "metadata") String metadataConcepts,
                                    Pageable pageable) {
        Map<Concept, String> conceptsMap = conceptService.readConceptsFromJsonObject(metadataConcepts);
        Page<Task> tasks = taskRepository.findByTaskTypeMetadataAndTaskStatus(type, isTerminalStatus, conceptsMap, pageable);
        ArrayList<ApiTaskResponse> taskResponses = new ArrayList<>();
        tasks.forEach(task -> taskResponses.add(ApiTaskResponse.fromTask(task, conceptRepository, conceptService)));
        return new ResponsePage(taskResponses, tasks.getNumberOfElements(), tasks.getTotalPages(), tasks.getSize());
    }

    private Task createTask(String externalId) {
        if (StringUtils.hasLength(externalId)) {
            Task task = taskRepository.findByLegacyId(externalId.trim());
            if (task != null) {
                return task;
            }
        }
        Task task = new Task();
        task.assignUUID();
        if (StringUtils.hasLength(externalId)) {
            task.setLegacyId(externalId.trim());
        }
        return task;
    }
}
