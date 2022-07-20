package org.avni.service;

import org.avni.dao.task.TaskUnAssignmentRepository;
import org.avni.domain.CHSEntity;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
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
}
