package org.avni.web.task;

import org.avni.dao.ConceptRepository;
import org.avni.dao.UserRepository;
import org.avni.dao.task.TaskRepository;
import org.avni.dao.task.TaskSearchCriteria;
import org.avni.dao.task.TaskStatusRepository;
import org.avni.dao.task.TaskTypeRepository;
import org.avni.service.ConceptService;
import org.avni.web.request.task.TaskFilterCriteria;
import org.avni.web.response.Response;
import org.avni.web.response.TaskSearchResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class TaskWebController {
    private final TaskTypeRepository taskTypeRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ConceptRepository conceptRepository;
    private final ConceptService conceptService;

    @Autowired
    public TaskWebController(TaskTypeRepository taskTypeRepository, TaskStatusRepository taskStatusRepository, TaskRepository taskRepository, UserRepository userRepository, ConceptRepository conceptRepository, ConceptService conceptService) {
        this.taskTypeRepository = taskTypeRepository;
        this.taskStatusRepository = taskStatusRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
    }

    @GetMapping(name = "/web/task")
    public List<TaskSearchResponse> getTasks(@RequestBody TaskFilterCriteria filterCriteria, Pageable pageable) {
        TaskSearchCriteria searchCriteria = new TaskSearchCriteria();
        searchCriteria.setTaskType(taskTypeRepository.getTaskType(filterCriteria.getTaskType()));
        searchCriteria.setTaskStatus(taskStatusRepository.getTaskStatus(filterCriteria.getTaskStatus()));
        searchCriteria.setAssignedTo(userRepository.findOne(filterCriteria.getAssignedTo()));
        filterCriteria.getMetadata().forEach(observationRequest -> {
            searchCriteria.addMetadata(conceptRepository.findByUuid(observationRequest.getConceptUUID()), observationRequest.getValue());
        });
        return taskRepository.search(searchCriteria, pageable).map(task -> {
            Map<String, Object> metadataMap = new HashMap<>();
            Response.mapObservations(conceptRepository, conceptService, metadataMap, task.getMetadata());
            return TaskSearchResponse.from(task, metadataMap);
        }).getContent();
    }
}
