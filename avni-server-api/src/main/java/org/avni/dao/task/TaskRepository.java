package org.avni.dao.task;

import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.ProgramEncounterRepository;
import org.avni.dao.TransactionalDataRepository;
import org.avni.domain.EncounterType;
import org.avni.domain.ProgramEncounter;
import org.avni.domain.User;
import org.avni.domain.task.Task;
import org.avni.web.request.task.TaskFilterCriteria;
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

import static org.springframework.data.jpa.domain.Specification.where;

@Repository
@RepositoryRestResource(collectionResourceRel = "task", path = "task", exported = false)
@PreAuthorize("hasAnyAuthority('user')")
public interface TaskRepository extends TransactionalDataRepository<Task>, FindByLastModifiedDateTime<Task> {

    Page<Task> findByAssignedToAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(User user, Date lastModifiedDateTime, Date now, Pageable pageable);

    boolean existsByAssignedToAndLastModifiedDateTimeGreaterThan(User user, Date lastModifiedDateTime);

    default Page<Task> search(TaskSearchCriteria searchCriteria, Pageable pageable) {
        Specification<Task> spec = (Root<Task> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (searchCriteria.getTaskType() != null)
                predicates.add(cb.equal(root.join("taskType"), searchCriteria.getTaskType()));
            if (searchCriteria.getTaskStatus() != null)
                predicates.add(cb.equal(root.join("taskStatus"), searchCriteria.getTaskStatus()));
            if (searchCriteria.getAssignedTo() != null)
                predicates.add(cb.equal(root.join("assignedTo"), searchCriteria.getAssignedTo()));

            searchCriteria.getMetadata().forEach((concept, value) -> {
                predicates.add(cb.equal(jsonExtractPathText(root.get("metadata"), concept.getUuid(), cb), value));
            });

            return cb.and(predicates.toArray(new Predicate[predicates.size()]));
        };
        return findAll(spec, pageable);
    }
}
