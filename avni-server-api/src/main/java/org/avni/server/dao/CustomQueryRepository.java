package org.avni.server.dao;

import org.avni.server.domain.CustomQuery;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@PreAuthorize("hasAnyAuthority('user')")
public interface CustomQueryRepository extends CHSRepository<CustomQuery> {

    CustomQuery findAllByName(String name);
}
