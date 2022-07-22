package org.avni.service;

import org.avni.common.EntityHelper;
import org.avni.dao.IndividualRepository;
import org.avni.dao.task.TaskRepository;
import org.avni.dao.task.TaskStatusRepository;
import org.avni.dao.task.TaskTypeRepository;
import org.avni.domain.CHSEntity;
import org.avni.domain.Individual;
import org.avni.domain.User;
import org.avni.domain.task.Task;
import org.avni.domain.task.TaskStatus;
import org.avni.domain.task.TaskType;
import org.avni.framework.security.UserContextHolder;
import org.avni.web.request.TaskRequest;
import org.joda.time.DateTime;
import org.springframework.stereotype.Service;

@Service
public class TaskService implements NonScopeAwareService {

    private final TaskRepository taskRepository;
    private final ObservationService observationService;
    private final TaskTypeRepository taskTypeRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final IndividualRepository individualRepository;

    public TaskService(TaskRepository taskRepository, ObservationService observationService,
                       TaskTypeRepository taskTypeRepository, TaskStatusRepository taskStatusRepository,
                       IndividualRepository individualRepository) {
        this.taskRepository = taskRepository;
        this.observationService = observationService;
        this.taskTypeRepository = taskTypeRepository;
        this.taskStatusRepository = taskStatusRepository;
        this.individualRepository = individualRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        User user = UserContextHolder.getUserContext().getUser();
        return taskRepository.existsByAssignedToAndLastModifiedDateTimeGreaterThan(user, CHSEntity.toDate(lastModifiedDateTime));
    }

    public Task save(TaskRequest taskRequest) {
        Task task = EntityHelper.newOrExistingEntity(taskRepository, taskRequest, new Task());
        TaskType taskType = taskTypeRepository.findByUuid(taskRequest.getTaskTypeUUID());
        TaskStatus taskStatus = taskStatusRepository.findByUuid(taskRequest.getTaskStatusUUID());
        Individual subject = individualRepository.findByUuid(taskRequest.getSubjectUUID());
        User user = UserContextHolder.getUserContext().getUser();
        task.setName(taskRequest.getName());
        task.setVoided(taskRequest.isVoided());
        task.setScheduledOn(taskRequest.getScheduledOn());
        task.setCompletedOn(taskRequest.getCompletedOn());
        task.setAssignedTo(user);
        task.setObservations(observationService.createObservations(taskRequest.getObservations()));
        task.setMetadata(observationService.createObservations(taskRequest.getMetadata()));
        task.setTaskType(taskType);
        task.setTaskStatus(taskStatus);
        task.setSubject(subject);
        return taskRepository.save(task);
    }
}
