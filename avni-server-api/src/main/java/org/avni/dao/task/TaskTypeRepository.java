package org.avni.dao.task;

import org.avni.dao.CHSRepository;
import org.avni.domain.task.TaskType;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskTypeRepository extends CrudRepository<TaskType, Long>, CHSRepository<TaskType> {
    TaskType findByName(String name);
    TaskType findById(long id);
}
