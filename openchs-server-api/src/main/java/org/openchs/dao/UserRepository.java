package org.openchs.dao;

import org.openchs.domain.User;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "user", path = "user")
@PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
public interface UserRepository extends PagingAndSortingRepository<User, Long> {
    User findByName(String username);
    User findByUuid(String uuid);

    @PreAuthorize("hasAnyAuthority('admin','organisation_admin', 'user')")
    User save(User user);
}