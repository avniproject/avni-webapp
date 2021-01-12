package org.openchs.dao;

import org.openchs.domain.Dashboard;
import org.openchs.domain.DashboardCardMapping;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "dashboardCardMapping", path = "dashboardCardMapping")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface DashboardCardMappingRepository extends ReferenceDataRepository<DashboardCardMapping>, FindByLastModifiedDateTime<DashboardCardMapping> {

    default DashboardCardMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }

    default DashboardCardMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }

    DashboardCardMapping findByCardIdAndDashboardAndIsVoidedFalse(Long cardId, Dashboard dashboard);
}
