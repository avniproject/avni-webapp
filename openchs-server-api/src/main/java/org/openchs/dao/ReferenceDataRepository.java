package org.openchs.dao;

import org.openchs.domain.CHSEntity;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.security.access.prepost.PreAuthorize;

@NoRepositoryBean
@PreAuthorize(value = "hasAnyAuthority('user', 'admin', 'organisation_admin')")
public interface ReferenceDataRepository<T extends CHSEntity> extends CHSRepository<T>, PagingAndSortingRepository<T, Long> {
    T findByName(String name);
    T findByNameIgnoreCase(String name);

    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    <S extends T> S save(S entity);

    T findById(long id);
}
