package org.openchs.dao;

import org.openchs.domain.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface ApprovalStatusRepository extends JpaRepository<ApprovalStatus, Long> {

    ApprovalStatus findByUuid(String uuid);
}
