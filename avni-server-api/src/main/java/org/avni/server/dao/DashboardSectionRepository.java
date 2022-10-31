package org.avni.server.dao;

import org.avni.server.domain.DashboardSection;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "dashboardSection", path = "dashboardSection")
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface DashboardSectionRepository extends ReferenceDataRepository<DashboardSection>, FindByLastModifiedDateTime<DashboardSection>, JpaSpecificationExecutor<DashboardSection> {

}
