package org.avni.server.dao.task;

import org.avni.server.dao.FindByLastModifiedDateTime;
import org.avni.server.dao.ReferenceDataRepository;
import org.avni.server.domain.task.TaskStatus;
import org.avni.server.domain.task.TaskType;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@PreAuthorize("hasAnyAuthority('user')")
@RepositoryRestResource(collectionResourceRel = "taskStatus", path = "taskStatus")
public interface TaskStatusRepository extends ReferenceDataRepository<TaskStatus>, FindByLastModifiedDateTime<TaskStatus> {
    TaskStatus findById(long id);

    default TaskStatus getTaskStatus(long taskStatusId) {
        if (taskStatusId < 0) return null;
        return findById(taskStatusId);
    }

    TaskStatus findByNameAndTaskType(String name, TaskType taskType);
}
