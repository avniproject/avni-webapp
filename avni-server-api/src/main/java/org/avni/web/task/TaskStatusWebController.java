package org.avni.web.task;

import org.avni.dao.task.TaskStatusRepository;
import org.avni.dao.task.TaskTypeRepository;
import org.avni.domain.task.TaskStatus;
import org.avni.domain.task.TaskType;
import org.avni.domain.task.TaskTypeName;
import org.avni.web.request.webapp.task.TaskStatusContract;
import org.avni.web.request.webapp.task.TaskTypeContract;
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
    private final TaskStatusRepository taskStatusRepository;
    private final TaskTypeRepository taskTypeRepository;

    @Autowired
    public TaskStatusWebController(TaskStatusRepository taskStatusRepository, TaskTypeRepository taskTypeRepository) {
        this.taskStatusRepository = taskStatusRepository;
        this.taskTypeRepository = taskTypeRepository;
    }

    @PostMapping(value = "/web/taskStatus")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public AvniEntityResponse post(@RequestBody TaskStatusContract request) {
        TaskStatus taskStatus = new TaskStatus();
        taskStatus.setVoided(request.isVoided());
        taskStatus.setName(request.getName());
        taskStatus.setTerminal(request.isTerminal());
        taskStatus.setTaskType(taskTypeRepository.findById(request.getTaskTypeId()));
        taskStatus.assignUUID();
        taskStatusRepository.save(taskStatus);
        return new AvniEntityResponse(taskStatus);
    }
}
