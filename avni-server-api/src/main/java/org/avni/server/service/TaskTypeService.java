package org.avni.server.service;

import org.avni.server.common.EntityHelper;
import org.avni.server.dao.task.TaskTypeRepository;
import org.avni.server.domain.task.TaskType;
import org.avni.server.domain.task.TaskTypeName;
import org.avni.server.web.request.webapp.task.TaskTypeContract;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskTypeService implements NonScopeAwareService {

    private final TaskTypeRepository taskTypeRepository;

    @Autowired
    public TaskTypeService(TaskTypeRepository taskTypeRepository) {
        this.taskTypeRepository = taskTypeRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return taskTypeRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }

    public List<TaskTypeContract> getAll() {
        return taskTypeRepository.findAll()
                .stream()
                .map(TaskTypeContract::fromEntity)
                .collect(Collectors.toList());
    }

    public TaskType saveTaskType(TaskTypeContract request) {
        TaskType taskType = EntityHelper.newOrExistingEntity(taskTypeRepository, request, new TaskType());
        taskType.setType(TaskTypeName.valueOf(request.getTaskTypeName()));
        taskType.setVoided(request.isVoided());
        taskType.setName(request.getName());
        taskType.setMetadataSearchFields(request.getMetadataSearchFields());
        taskType.assignUUIDIfRequired();
        taskTypeRepository.save(taskType);
        return taskType;
    }
}
