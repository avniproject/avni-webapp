package org.avni.server.service;

import org.avni.server.dao.task.TaskUnAssignmentRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.User;
import org.avni.server.domain.task.Task;
import org.avni.server.domain.task.TaskUnAssignment;
import org.avni.server.framework.security.UserContextHolder;
import org.joda.time.DateTime;
import org.springframework.stereotype.Service;

@Service
public class TaskUnAssigmentService implements NonScopeAwareService {

    private final TaskUnAssignmentRepository taskUnAssignmentRepository;

    public TaskUnAssigmentService(TaskUnAssignmentRepository taskUnAssignmentRepository) {
        this.taskUnAssignmentRepository = taskUnAssignmentRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        User user = UserContextHolder.getUserContext().getUser();
        return taskUnAssignmentRepository.existsByUnassignedUserAndLastModifiedDateTimeGreaterThan(user, CHSEntity.toDate(lastModifiedDateTime));
    }

    public void saveTaskUnAssignment(Task task, User user) {
        TaskUnAssignment taskUnAssignment = new TaskUnAssignment();
        taskUnAssignment.assignUUID();
        taskUnAssignment.setTask(task);
        taskUnAssignment.setUnassignedUser(user);
        taskUnAssignmentRepository.save(taskUnAssignment);
    }
}
