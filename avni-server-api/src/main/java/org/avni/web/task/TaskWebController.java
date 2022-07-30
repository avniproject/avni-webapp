package org.avni.web.task;

import org.avni.dao.ConceptRepository;
import org.avni.domain.JsonObject;
import org.avni.domain.task.Task;
import org.avni.service.ConceptService;
import org.avni.service.TaskService;
import org.avni.web.request.task.TaskAssignmentRequest;
import org.avni.web.request.task.TaskFilterCriteria;
import org.avni.web.response.Response;
import org.avni.web.response.TaskSearchResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.HashMap;
import java.util.Map;

@RestController
public class TaskWebController {
    private final ConceptRepository conceptRepository;
    private final ConceptService conceptService;
    private final TaskService taskService;

    @Autowired
    public TaskWebController(ConceptRepository conceptRepository, ConceptService conceptService, TaskService taskService) {
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.taskService = taskService;
    }

    @RequestMapping(value = "/web/task", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public Page<TaskSearchResponse> getTasks(@RequestBody TaskFilterCriteria filterCriteria, Pageable pageable) {
        Page<Task> searchResult = taskService.searchTaskByCriteria(filterCriteria, pageable);
        return searchResult.map(task -> {
            Map<String, Object> metadataMap = new HashMap<>();
            Response.mapObservations(conceptRepository, conceptService, metadataMap, task.getMetadata());
            return TaskSearchResponse.from(task, metadataMap);
        });
    }

    @RequestMapping(value = "/web/taskMetadata", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public JsonObject getTaskMetadataForSearch() {
        return taskService.getTaskMetaData();
    }

    @RequestMapping(value = "/web/taskAssignment", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public void taskAssignment(@RequestBody TaskAssignmentRequest taskAssignmentRequest) {
        taskService.assignTask(taskAssignmentRequest);
    }

}
