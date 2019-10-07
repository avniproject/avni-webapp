package org.openchs.dao;

import org.openchs.domain.CHSEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@NoRepositoryBean
@PreAuthorize(value = "hasAnyAuthority('user', 'admin', 'organisation_admin')")
public interface ReferenceDataRepository<T extends CHSEntity> extends CHSRepository<T>, PagingAndSortingRepository<T, Long> {
    T findByName(String name);
    T findByNameIgnoreCase(String name);

    Page<T> findPageByIsVoidedFalse(Pageable pageable);

    List<T> findAllByOrganisationId(Long organisationId);
    Page<T> findAllByOrganisationId(Long organisationId, Pageable pageable);


    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    <S extends T> S save(S entity);

    T findById(long id);

    default T findByUuidOrName(String name, String uuid) {
        return uuid != null ? findByUuid(uuid) : findByName(name);
    }
}
