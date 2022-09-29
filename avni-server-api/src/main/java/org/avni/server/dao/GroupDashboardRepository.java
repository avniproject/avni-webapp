package org.avni.server.dao;

import org.avni.server.domain.GroupDashboard;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "groupDashboard", path = "groupDashboard")
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface GroupDashboardRepository extends ReferenceDataRepository<GroupDashboard>, FindByLastModifiedDateTime<GroupDashboard> {

    default GroupDashboard findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in GroupDashboard");
    }

    default GroupDashboard findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in GroupDashboard");
    }

    List<GroupDashboard> findByGroup_IdAndIsVoidedFalse(Long groupId);

    List<GroupDashboard> findByGroup_IdAndIdNotAndIsVoidedFalse(Long groupId, Long Id);
}
