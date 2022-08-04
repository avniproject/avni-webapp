package org.avni.dao.task;

import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.TransactionalDataRepository;
import org.avni.domain.User;
import org.avni.domain.task.Task;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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
}
