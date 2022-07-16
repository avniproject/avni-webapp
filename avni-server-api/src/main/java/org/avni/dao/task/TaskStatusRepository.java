package org.avni.dao.task;

import org.avni.domain.task.TaskStatus;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskStatusRepository extends CrudRepository<TaskStatus, Long> {
    TaskStatus findByName(String name);
}
