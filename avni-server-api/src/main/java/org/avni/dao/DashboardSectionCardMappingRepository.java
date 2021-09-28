package org.avni.dao;

import org.avni.domain.Dashboard;
import org.avni.domain.DashboardSection;
import org.avni.domain.DashboardSectionCardMapping;
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
