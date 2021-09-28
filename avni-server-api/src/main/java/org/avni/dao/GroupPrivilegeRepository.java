package org.avni.dao;

import org.avni.domain.GroupPrivilege;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "groupPrivilege", path = "groupPrivilege")
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface GroupPrivilegeRepository extends ReferenceDataRepository<GroupPrivilege>, FindByLastModifiedDateTime<GroupPrivilege> {
    default GroupPrivilege findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in GroupPrivilege.");
    }

    default GroupPrivilege findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in GroupPrivilege.");
    }

    List<GroupPrivilege> findByGroup_Id(Long groupId);
}
