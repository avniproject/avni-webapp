package org.avni.dao.task;

import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.ReferenceDataRepository;
import org.avni.domain.task.TaskStatus;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@PreAuthorize("hasAnyAuthority('user')")
@RepositoryRestResource(collectionResourceRel = "taskStatus", path = "taskStatus")
public interface TaskStatusRepository extends ReferenceDataRepository<TaskStatus>, FindByLastModifiedDateTime<TaskStatus> {
}
