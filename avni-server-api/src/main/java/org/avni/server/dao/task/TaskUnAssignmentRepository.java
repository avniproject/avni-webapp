package org.avni.server.dao.task;

import org.avni.server.dao.FindByLastModifiedDateTime;
import org.avni.server.dao.TransactionalDataRepository;
import org.avni.server.domain.User;
import org.avni.server.domain.task.TaskUnAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
@PreAuthorize("hasAnyAuthority('user')")
public interface TaskUnAssignmentRepository extends TransactionalDataRepository<TaskUnAssignment>, FindByLastModifiedDateTime<TaskUnAssignment> {

    Page<TaskUnAssignment> findByUnassignedUserAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(User user, Date lastModifiedDateTime, Date now, Pageable pageable);

    boolean existsByUnassignedUserAndLastModifiedDateTimeGreaterThan(User user, Date lastModifiedDateTime);
}
