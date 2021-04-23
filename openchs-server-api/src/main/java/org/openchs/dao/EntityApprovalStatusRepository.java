package org.openchs.dao;

import org.openchs.domain.ApprovalStatus;
import org.openchs.domain.EntityApprovalStatus;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "entityApprovalStatus", path = "entityApprovalStatus")
@PreAuthorize("hasAnyAuthority('user','organisation_admin')")
public interface EntityApprovalStatusRepository extends TransactionalDataRepository<EntityApprovalStatus>, FindByLastModifiedDateTime<EntityApprovalStatus> {
    List<EntityApprovalStatus> findByEntityIdAndEntityTypeAndApprovalStatusAndIsVoidedFalse(Long entityId, EntityApprovalStatus.EntityType entityType, ApprovalStatus approvalStatus);
}
