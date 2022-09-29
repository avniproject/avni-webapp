package org.avni.server.dao.task;

import org.avni.server.dao.FindByLastModifiedDateTime;
import org.avni.server.dao.TransactionalDataRepository;
import org.avni.server.domain.Concept;
import org.avni.server.domain.User;
import org.avni.server.domain.task.Task;
import org.avni.server.domain.task.TaskStatus;
import org.avni.server.domain.task.TaskType;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Repository
@RepositoryRestResource(collectionResourceRel = "task", path = "task", exported = false)
@PreAuthorize("hasAnyAuthority('user')")
public interface TaskRepository extends TransactionalDataRepository<Task>, FindByLastModifiedDateTime<Task> {

    Page<Task> findByAssignedToAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(User user, Date lastModifiedDateTime, Date now, Pageable pageable);

    boolean existsByAssignedToAndLastModifiedDateTimeGreaterThan(User user, Date lastModifiedDateTime);

    default Page<Task> search(TaskSearchCriteria searchCriteria, boolean isUnassigned, Pageable pageable) {
        Specification<Task> spec = (Root<Task> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            String today = TaskSearchCriteria.DATE_TIME_FORMATTER.print(new DateTime());
            if (searchCriteria.getTaskType() != null)
                predicates.add(cb.equal(root.join("taskType"), searchCriteria.getTaskType()));
            if (searchCriteria.getTaskStatus() != null)
                predicates.add(cb.equal(root.join("taskStatus"), searchCriteria.getTaskStatus()));
            if (searchCriteria.getAssignedTo() != null)
                predicates.add(cb.equal(root.join("assignedTo"), searchCriteria.getAssignedTo()));
            if (isUnassigned)
                predicates.add(cb.isNull(root.get("assignedTo")));
            if (searchCriteria.getCreatedOn() != null)
                predicates.add(cb.between(convertToDate(root.get("createdDateTime"), cb), searchCriteria.getFormattedCreatedOn(), today));
            if (searchCriteria.getCompletedOn() != null)
                predicates.add(cb.between(convertToDate(root.get("completedOn"), cb), searchCriteria.getFormattedCreatedOn(), today));

            searchCriteria.getMetadata().forEach((concept, value) -> {
                predicates.add(cb.equal(jsonExtractPathText(root.get("metadata"), concept.getUuid(), cb), value));
            });

            return cb.and(predicates.toArray(new Predicate[predicates.size()]));
        };
        return findAll(spec, pageable);
    }

    List<Task> findAllByIdIn(List<Long> id);

    @Query("select t from Task t where t.legacyId = :id")
    Task findByLegacyId(String id);

    default Specification<Task> findByTaskTypeSpec(String taskType) {
        return (Root<Task> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Join<Task, TaskType> taskTaskTypeJoin = root.join("taskType", JoinType.LEFT);
            return cb.and(cb.equal(taskTaskTypeJoin.get("name"), taskType));
        };
    }

    default Specification<Task> findByTaskStatusIsTerminal(boolean isCurrentStatusTerminal) {
        return (Root<Task> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Join<Task, TaskStatus> taskTaskStatusJoin = root.join("taskStatus", JoinType.LEFT);
            return cb.and(cb.equal(taskTaskStatusJoin.get("isTerminal"), isCurrentStatusTerminal));
        };
    }

    default Page<Task> findByTaskTypeMetadataAndTaskStatus(String taskType, boolean isTerminalStatus, Map<Concept, String> concepts, Pageable pageable) {
        return findAll(withConceptValues(concepts, "metadata")
                .and(findByTaskTypeSpec(taskType))
                .and(findByTaskStatusIsTerminal(isTerminalStatus)), pageable);
    }

}
