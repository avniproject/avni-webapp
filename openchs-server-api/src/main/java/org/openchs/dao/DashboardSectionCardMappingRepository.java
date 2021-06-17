package org.openchs.dao;

import org.openchs.domain.Dashboard;
import org.openchs.domain.DashboardSection;
import org.openchs.domain.DashboardSectionCardMapping;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "dashboardSectionCardMapping", path = "dashboardSectionCardMapping")
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface DashboardSectionCardMappingRepository extends ReferenceDataRepository<DashboardSectionCardMapping>, FindByLastModifiedDateTime<DashboardSectionCardMapping> {

    default DashboardSectionCardMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }

    default DashboardSectionCardMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }

    DashboardSectionCardMapping findByCardIdAndDashboardSectionAndIsVoidedFalse(Long id, DashboardSection section);

}
