package org.avni.server.web.task;

import org.avni.server.service.TaskTypeService;
import org.avni.server.web.response.AvniEntityResponse;
import org.avni.server.web.request.webapp.task.TaskTypeContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TaskTypeWebController {
    private final TaskTypeService taskTypeService;

    @Autowired
    public TaskTypeWebController(TaskTypeService taskTypeService) {
        this.taskTypeService = taskTypeService;
    }

    @PostMapping(value = "/web/taskTypes")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public void post(@RequestBody List<TaskTypeContract> requests) {
        requests.forEach(this::post);
    }

    @PostMapping(value = "/web/taskType")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public AvniEntityResponse post(@RequestBody TaskTypeContract request) {
        return new AvniEntityResponse(taskTypeService.saveTaskType(request));
    }

}
