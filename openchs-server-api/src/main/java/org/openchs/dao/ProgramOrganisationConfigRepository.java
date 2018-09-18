package org.openchs.dao;

import org.openchs.domain.Program;
import org.openchs.domain.ProgramOrganisationConfig;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "programConfig", path = "programConfig")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface ProgramOrganisationConfigRepository extends PagingAndSortingRepository<ProgramOrganisationConfig, Long>, CHSRepository<ProgramOrganisationConfig>, FindByLastModifiedDateTime<ProgramOrganisationConfig> {
    ProgramOrganisationConfig findByProgram(Program program);
}
