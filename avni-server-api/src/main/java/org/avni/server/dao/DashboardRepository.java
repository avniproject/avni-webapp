package org.avni.server.dao;

import org.avni.server.domain.Dashboard;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "dashboard", path = "dashboard")
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface DashboardRepository extends ReferenceDataRepository<Dashboard>, FindByLastModifiedDateTime<Dashboard>, JpaSpecificationExecutor<Dashboard> {

    @Query("select d.name from Dashboard d where d.isVoided = false")
    List<String> getAllNames();
}
