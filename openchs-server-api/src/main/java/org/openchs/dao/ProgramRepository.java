package org.openchs.dao;

import org.openchs.domain.Program;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "program", path = "program")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface ProgramRepository extends PagingAndSortingRepository<Program, Long>, ReferenceDataRepository<Program>, FindByLastModifiedDateTime<Program> {
    Program findById(long programId);
}