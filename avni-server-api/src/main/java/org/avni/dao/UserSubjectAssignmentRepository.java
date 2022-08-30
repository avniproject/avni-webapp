package org.avni.dao;

import org.avni.domain.User;
import org.avni.domain.UserSubjectAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
@RepositoryRestResource(collectionResourceRel = "userSubjectAssignment", path = "userSubjectAssignment", exported = false)
public interface UserSubjectAssignmentRepository extends TransactionalDataRepository<UserSubjectAssignment> {

    boolean existsByUserAndIsVoidedTrueAndLastModifiedDateTimeGreaterThan(User user, Date lastModifiedDateTime);

    Page<UserSubjectAssignment> findByUserAndIsVoidedTrueAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            User user,
            Date lastModifiedDate,
            Date now,
            Pageable pageable
    );
}
