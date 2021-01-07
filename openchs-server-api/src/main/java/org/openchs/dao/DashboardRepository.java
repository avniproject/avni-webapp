package org.openchs.dao;

import org.openchs.domain.Dashboard;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "dashboard", path = "dashboard")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface DashboardRepository extends ReferenceDataRepository<Dashboard>, FindByLastModifiedDateTime<Dashboard>, JpaSpecificationExecutor<Dashboard> {


}
