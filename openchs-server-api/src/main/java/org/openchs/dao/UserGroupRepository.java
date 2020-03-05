package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.UserGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "myGroups", path = "myGroups")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface UserGroupRepository extends ReferenceDataRepository<UserGroup> {

    Page<UserGroup> findByUserIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            Long userId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    default UserGroup findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in UserGroup.");
    }

    default UserGroup findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in UserGroup.");
    }
}
