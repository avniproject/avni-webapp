package org.openchs.dao;

import org.openchs.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;


@Repository
@RepositoryRestResource(collectionResourceRel = "user", path = "user")
@PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
public interface UserRepository extends PagingAndSortingRepository<User, Long> {
    User findByUsername(String username);
    User findByUuid(String uuid);
    User findById(Long id);

    @PreAuthorize("hasAnyAuthority('admin','organisation_admin', 'user')")
    User save(User user);

    @RestResource(path = "findByOrganisation", rel = "findByOrganisation")
    Page<User> findByOrganisationIdAndIsVoidedFalse(@Param("organisationId") Long organisationId, Pageable pageable);
}
