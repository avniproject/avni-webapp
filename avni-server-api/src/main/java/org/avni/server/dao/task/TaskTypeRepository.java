package org.avni.server.dao.task;

import org.avni.server.dao.FindByLastModifiedDateTime;
import org.avni.server.dao.ReferenceDataRepository;
import org.avni.server.domain.task.TaskType;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@PreAuthorize("hasAnyAuthority('user')")
@RepositoryRestResource(collectionResourceRel = "taskType", path = "taskType")
public interface TaskTypeRepository extends ReferenceDataRepository<TaskType>, FindByLastModifiedDateTime<TaskType> {
    TaskType findById(long id);
    default TaskType getTaskType(long id) {
        if (id < 0) return null;
        return findById(id);
    }
}
