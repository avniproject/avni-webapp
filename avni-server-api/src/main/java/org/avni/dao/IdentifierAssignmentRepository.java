package org.avni.dao;

import org.joda.time.DateTime;
import org.avni.domain.IdentifierAssignment;
import org.avni.domain.IdentifierSource;
import org.avni.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "identifierAssignment", path = "identifierAssignment")
public interface IdentifierAssignmentRepository extends TransactionalDataRepository<IdentifierAssignment>, FindByLastModifiedDateTime<IdentifierAssignment> {
    Page<IdentifierAssignment> findByAssignedToAndAuditLastModifiedDateTimeGreaterThanAndIsVoidedFalseAndIndividualIsNullAndProgramEnrolmentIsNullOrderByAssignmentOrderAsc(User currentUser, DateTime lastModifiedDateTime, Pageable pageable);

    Integer countIdentifierAssignmentByIdentifierSourceEqualsAndAndAssignedToEqualsAndIndividualIsNullAndProgramEnrolmentIsNull(IdentifierSource identifierSource, User assignedTo);

    boolean existsByAssignedToAndAuditLastModifiedDateTimeGreaterThanAndIsVoidedFalseAndIndividualIsNullAndProgramEnrolmentIsNull(User currentUser, DateTime lastModifiedDateTime);
}
