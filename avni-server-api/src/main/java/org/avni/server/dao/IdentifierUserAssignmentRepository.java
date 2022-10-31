package org.avni.server.dao;

import org.avni.server.domain.IdentifierSource;
import org.avni.server.domain.IdentifierUserAssignment;
import org.avni.server.domain.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "identifierUserAssignment", path = "identifierUserAssignment")
public interface IdentifierUserAssignmentRepository extends ReferenceDataRepository<IdentifierUserAssignment>, FindByLastModifiedDateTime<IdentifierUserAssignment> {

    @Query("select iua " +
            "from IdentifierUserAssignment iua " +
            "where iua.assignedTo = :user and iua.identifierSource = :identifierSource and " +
            "      (iua.lastAssignedIdentifier is null or " +
            "      iua.identifierEnd <> iua.lastAssignedIdentifier)" +
            "    order by iua.identifierStart asc")
    List<IdentifierUserAssignment> getAllNonExhaustedUserAssignments(
            @Param("user") User user,
            @Param("identifierSource") IdentifierSource identifierSource);

    default IdentifierUserAssignment findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in IdentifierUserAssignment");
    }

    default IdentifierUserAssignment findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in IdentifierUserAssignment");
    }
}
