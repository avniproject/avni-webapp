package org.avni.server.dao;

import java.util.Date;
import org.avni.server.domain.IdentifierAssignment;
import org.avni.server.domain.IdentifierSource;
import org.avni.server.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "identifierAssignment", path = "identifierAssignment")
public interface IdentifierAssignmentRepository extends TransactionalDataRepository<IdentifierAssignment>, FindByLastModifiedDateTime<IdentifierAssignment> {
    Page<IdentifierAssignment> findByAssignedToAndLastModifiedDateTimeGreaterThanAndIsVoidedFalseAndIndividualIsNullAndProgramEnrolmentIsNullOrderByAssignmentOrderAsc(User currentUser, Date lastModifiedDateTime, Pageable pageable);

    Integer countIdentifierAssignmentByIdentifierSourceEqualsAndAndAssignedToEqualsAndIndividualIsNullAndProgramEnrolmentIsNull(IdentifierSource identifierSource, User assignedTo);

    boolean existsByAssignedToAndLastModifiedDateTimeGreaterThanAndIsVoidedFalseAndIndividualIsNullAndProgramEnrolmentIsNull(User currentUser, Date lastModifiedDateTime);
}
