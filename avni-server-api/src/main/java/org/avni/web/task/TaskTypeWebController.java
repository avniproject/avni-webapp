package org.avni.web.task;

import org.avni.dao.task.TaskTypeRepository;
import org.avni.domain.ObservationCollection;
import org.avni.domain.task.TaskType;
import org.avni.domain.task.TaskTypeName;
import org.avni.service.ObservationService;
import org.avni.web.request.webapp.task.TaskTypeContract;
import org.avni.web.response.AvniEntityResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TaskTypeWebController {
    private final TaskTypeRepository taskTypeRepository;
    private final ObservationService observationService;

    @Autowired
    public TaskTypeWebController(TaskTypeRepository taskTypeRepository, ObservationService observationService) {
        this.taskTypeRepository = taskTypeRepository;
        this.observationService = observationService;
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
        TaskType taskType = new TaskType();
        taskType.setType(TaskTypeName.valueOf(request.getTaskTypeName()));
        taskType.setVoided(request.isVoided());
        taskType.setName(request.getName());
        taskType.setMetadataSearchFields(observationService.createObservations(request.getMetadataSearchFields()));
        taskType.assignUUID();
        taskTypeRepository.save(taskType);
        return new AvniEntityResponse(taskType);
    }
}
