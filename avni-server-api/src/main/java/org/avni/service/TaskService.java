package org.avni.service;

import org.avni.dao.task.TaskRepository;
import org.avni.domain.CHSEntity;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
import org.joda.time.DateTime;
import org.springframework.stereotype.Service;

@Service
public class TaskService implements NonScopeAwareService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        User user = UserContextHolder.getUserContext().getUser();
        return taskRepository.existsByAssignedToAndLastModifiedDateTimeGreaterThan(user, CHSEntity.toDate(lastModifiedDateTime));
    }
}
