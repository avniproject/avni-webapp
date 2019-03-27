package org.openchs.dao;

import org.openchs.domain.IdentifierSource;
import org.openchs.domain.IdentifierUserAssignment;
import org.openchs.domain.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "identifierUserAssignment", path = "identifierUserAssignment")
public interface IdentifierUserAssignmentRepository extends TransactionalDataRepository<IdentifierUserAssignment>, FindByLastModifiedDateTime<IdentifierUserAssignment> {

    @Query("select iua " +
            "from IdentifierUserAssignment iua " +
            "where iua.assignedTo = :user and iua.identifierSource = :identifierSource and " +
            "      (iua.lastAssignedIdentifier is null or " +
            "      iua.identifierEnd <> iua.lastAssignedIdentifier)")
    List<IdentifierUserAssignment> getAllNonExhaustedUserAssignments(
            @Param("user") User user,
            @Param("identifierSource") IdentifierSource identifierSource);
}