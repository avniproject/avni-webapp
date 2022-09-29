package org.avni.server.dao;

import org.avni.server.domain.EntityApprovalStatus;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "entityApprovalStatus", path = "entityApprovalStatus")
@PreAuthorize("hasAnyAuthority('user')")
public interface EntityApprovalStatusRepository extends TransactionalDataRepository<EntityApprovalStatus>, FindByLastModifiedDateTime<EntityApprovalStatus> {
    EntityApprovalStatus findFirstByEntityIdAndEntityTypeAndIsVoidedFalseOrderByStatusDateTimeDesc(Long entityId, EntityApprovalStatus.EntityType entityType);
}
