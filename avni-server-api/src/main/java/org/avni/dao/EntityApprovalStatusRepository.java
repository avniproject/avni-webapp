package org.avni.dao;

import org.avni.domain.ApprovalStatus;
import org.avni.domain.EntityApprovalStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "entityApprovalStatus", path = "entityApprovalStatus")
@PreAuthorize("hasAnyAuthority('user')")
public interface EntityApprovalStatusRepository extends TransactionalDataRepository<EntityApprovalStatus>, FindByLastModifiedDateTime<EntityApprovalStatus> {
    List<EntityApprovalStatus> findByEntityIdAndEntityTypeAndApprovalStatusAndIsVoidedFalse(Long entityId, EntityApprovalStatus.EntityType entityType, ApprovalStatus approvalStatus);

    EntityApprovalStatus findFirstByEntityIdAndEntityTypeAndIsVoidedFalseOrderByStatusDateTimeDesc(Long entityId, EntityApprovalStatus.EntityType entityType);
}
