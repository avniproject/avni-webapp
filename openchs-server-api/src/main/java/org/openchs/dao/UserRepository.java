package org.openchs.dao;

import org.openchs.domain.User;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "user", path = "user")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface UserRepository extends PagingAndSortingRepository<User, Long>, CHSRepository<User> {
    User findByName(String username);
}