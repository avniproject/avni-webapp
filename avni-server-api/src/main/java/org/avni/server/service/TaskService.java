package org.avni.server.service;

import org.avni.server.common.EntityHelper;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.dao.task.TaskRepository;
import org.avni.server.dao.task.TaskSearchCriteria;
import org.avni.server.dao.task.TaskStatusRepository;
import org.avni.server.dao.task.TaskTypeRepository;
import org.avni.server.domain.*;
import org.avni.server.domain.task.Task;
import org.avni.server.domain.task.TaskStatus;
import org.avni.server.domain.task.TaskType;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.projection.UserWebProjection;
import org.avni.server.web.request.TaskRequest;
import org.avni.server.web.request.task.TaskAssignmentRequest;
import org.avni.server.web.request.task.TaskFilterCriteria;
import org.avni.server.web.request.webapp.task.TaskStatusContract;
import org.avni.server.web.request.webapp.task.TaskTypeContract;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService implements NonScopeAwareService {

    private final TaskRepository taskRepository;
    private final ObservationService observationService;
    private final TaskTypeRepository taskTypeRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final IndividualRepository individualRepository;
    private final UserRepository userRepository;
    private final ConceptRepository conceptRepository;
    private final ConceptService conceptService;
    private final TaskUnAssigmentService taskUnAssigmentService;

    public TaskService(TaskRepository taskRepository, ObservationService observationService,
                       TaskTypeRepository taskTypeRepository, TaskStatusRepository taskStatusRepository,
                       IndividualRepository individualRepository, UserRepository userRepository,
                       ConceptRepository conceptRepository, ConceptService conceptService,
                       TaskUnAssigmentService taskUnAssigmentService) {
        this.taskRepository = taskRepository;
        this.observationService = observationService;
        this.taskTypeRepository = taskTypeRepository;
        this.taskStatusRepository = taskStatusRepository;
        this.individualRepository = individualRepository;
        this.userRepository = userRepository;
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.taskUnAssigmentService = taskUnAssigmentService;
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

    public Page<Task> searchTaskByCriteria(@RequestBody TaskFilterCriteria filterCriteria, Pageable pageable) {
        TaskSearchCriteria searchCriteria = new TaskSearchCriteria();
        searchCriteria.setTaskType(taskTypeRepository.getTaskType(filterCriteria.getTaskType()));
        searchCriteria.setTaskStatus(taskStatusRepository.getTaskStatus(filterCriteria.getTaskStatus()));
        if (filterCriteria.getAssignedTo() != null)
            searchCriteria.setAssignedTo(userRepository.findOne(filterCriteria.getAssignedTo()));
        filterCriteria.getMetadata().forEach(observationRequest -> {
            Concept concept = conceptRepository.findByName(observationRequest.getConceptName());
            Object value = observationRequest.getValue();
            if (concept.isCoded()) {
                Concept answerConcept = conceptRepository.findByNameIgnoreCase((String) value);
                if (answerConcept != null) {
                    searchCriteria.addMetadata(concept, answerConcept.getUuid());
                }
            } else {
                searchCriteria.addMetadata(concept, value);
            }
        });
        searchCriteria.setCompletedOn(filterCriteria.getCompletedOn());
        searchCriteria.setCreatedOn(filterCriteria.getCreatedOn());
        return taskRepository.search(searchCriteria, filterCriteria.isUnassigned(), pageable);
    }

    public JsonObject getTaskMetaData() {
        JsonObject response = new JsonObject();
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        List<TaskTypeContract> taskTypes = taskTypeRepository.findAllByIsVoidedFalse()
                .stream()
                .map(taskType -> TaskTypeContract.fromEntity(taskType, conceptService))
                .collect(Collectors.toList());
        List<TaskStatusContract> taskStatuses = taskStatusRepository.findAllByIsVoidedFalse()
                .stream()
                .map(TaskStatusContract::fromEntity)
                .collect(Collectors.toList());
        List<UserWebProjection> users = userRepository.findAllByOrganisationIdAndIsVoidedFalse(organisation.getId());
        response.with("taskTypes", taskTypes)
                .with("taskStatuses", taskStatuses)
                .with("users", users);
        return response;
    }

    public void assignTask(TaskAssignmentRequest taskAssignmentRequest) {
        if (taskAssignmentRequest.isAllSelected()) {
            assignmentForSelectedAll(taskAssignmentRequest);
        } else if (!taskAssignmentRequest.getTaskIds().isEmpty()) {
            assignmentForSelectedTaskIds(taskAssignmentRequest);
        }
    }

    private void assignmentForSelectedAll(TaskAssignmentRequest taskAssignmentRequest) {
        Page<Task> taskPage = searchTaskByCriteria(taskAssignmentRequest.getTaskFilterCriteria(), PageRequest.of(0, 1000));
        List<User> users = userRepository.findByIdIn(taskAssignmentRequest.getAssignedToUserIdArray());
        List<Task> tasksToUpdate = taskPage.getContent();
        TaskStatus taskStatus = null;
        if (taskAssignmentRequest.getStatusId() != null) {
            taskStatus = taskStatusRepository.findOne(taskAssignmentRequest.getStatusId());
        }
        assignTasksEquallyToUsers(taskPage.getTotalElements(), users, tasksToUpdate, taskStatus);
        taskRepository.saveAll(tasksToUpdate);
    }

    private void assignTasksEquallyToUsers(long totalTasks, List<User> users, List<Task> tasksToUpdate, TaskStatus taskStatus) {
        int totalUsers = users.size();
        int userIndex = 0;
        for (int i = 0; i < totalTasks; i++) {
            Task task = tasksToUpdate.get(i);
            User newAssignment = users.get(userIndex);
            populateTaskUnAssignment(task.getAssignedTo(), newAssignment, task);
            task.setAssignedTo(newAssignment);
            if (taskStatus != null) {
                task.setTaskStatus(taskStatus);
                if (taskStatus.isTerminal()) {
                    task.setCompletedOn(new DateTime());
                }
            }
            if (userIndex + 1 != totalUsers && (i + 1) == ((userIndex + 1) * (totalTasks / totalUsers))) {
                userIndex++;
            }
        }
    }

    private void populateTaskUnAssignment(User olderUser, User newUser, Task task) {
        if (olderUser != null && !olderUser.getId().equals(newUser.getId())) {
            taskUnAssigmentService.saveTaskUnAssignment(task, olderUser);
        }
    }

    private void assignmentForSelectedTaskIds(TaskAssignmentRequest taskAssignmentRequest) {
        List<User> users = userRepository.findByIdIn(taskAssignmentRequest.getAssignedToUserIdArray());
        List<Task> tasksToUpdate = taskRepository.findAllByIdIn(taskAssignmentRequest.getTaskIds());
        if (users.size() > tasksToUpdate.size()) {
            throw new IllegalArgumentException("Users cannot be more than the selected tasks");
        }
        TaskStatus taskStatus = null;
        if (taskAssignmentRequest.getStatusId() != null) {
            taskStatus = taskStatusRepository.findOne(taskAssignmentRequest.getStatusId());
        }
        assignTasksEquallyToUsers(tasksToUpdate.size(), users, tasksToUpdate, taskStatus);
        taskRepository.saveAll(tasksToUpdate);
    }
}
