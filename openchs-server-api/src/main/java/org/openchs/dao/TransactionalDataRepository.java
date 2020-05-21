package org.openchs.dao;

import org.openchs.domain.CHSEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.security.access.prepost.PreAuthorize;

@NoRepositoryBean
@PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
public interface TransactionalDataRepository<T extends CHSEntity> extends CHSRepository<T>, JpaRepository<T, Long>, JpaSpecificationExecutor<T> {
    default T findOne(Long id) {
        return findById(id).orElse(null);
    }
}
