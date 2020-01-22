package org.openchs.dao;

import org.openchs.domain.Gender;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "gender", path = "gender")
public interface GenderRepository extends CHSRepository<Gender>, PagingAndSortingRepository<Gender, Long>, FindByLastModifiedDateTime<Gender> {
    Gender findByName(String name);
    Gender findByNameIgnoreCase(String name);

    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    Gender save(Gender gender);

    default Gender findOne(long id) {
        return findById(id).orElse(null);
    };

    default Gender findByUuidOrName(String name, String uuid) {
        return uuid != null ? findByUuid(uuid) : findByName(name);
    }
}