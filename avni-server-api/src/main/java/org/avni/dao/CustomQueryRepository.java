package org.avni.dao;

import org.avni.domain.CustomQuery;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@PreAuthorize("hasAnyAuthority('user')")
public interface CustomQueryRepository extends CHSRepository<CustomQuery> {

    CustomQuery findAllByName(String name);
}
