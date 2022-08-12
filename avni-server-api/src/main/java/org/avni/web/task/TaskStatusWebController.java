package org.avni.web.task;

import org.avni.service.TaskStatusService;
import org.avni.web.request.webapp.task.TaskStatusContract;
import org.avni.web.response.AvniEntityResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TaskStatusWebController {
    private final TaskStatusService taskStatusService;

    @Autowired
    public TaskStatusWebController(TaskStatusService taskStatusService) {
        this.taskStatusService = taskStatusService;
    }

    @PostMapping(value = "/web/taskStatus")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public AvniEntityResponse post(@RequestBody TaskStatusContract request) {
        return new AvniEntityResponse(taskStatusService.saveTaskStatus(request));
    }

}
