package org.avni.dao;

import org.avni.domain.Individual;
import org.avni.domain.User;
import org.avni.domain.UserSubjectAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
@RepositoryRestResource(collectionResourceRel = "userSubjectAssignment", path = "userSubjectAssignment", exported = false)
public interface UserSubjectAssignmentRepository extends ReferenceDataRepository<UserSubjectAssignment> {

    Optional<UserSubjectAssignment> findUserSubjectAssignmentByUserAndSubject(User user, Individual subject);
    boolean existsByUserAndIsVoidedTrueAndLastModifiedDateTimeGreaterThan(User user, Date lastModifiedDateTime);

    Page<UserSubjectAssignment> findByUserAndIsVoidedTrueAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            User user,
            Date lastModifiedDate,
            Date now,
            Pageable pageable
    );

    Page<UserSubjectAssignment> findByUserIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            Long userId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable);

    default UserSubjectAssignment findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in UserSubjectAssignment.");
    }

    default UserSubjectAssignment findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in UserSubjectAssignment.");
    }

    List<UserSubjectAssignment> findByOrganisationId(Long organisationId);

}
