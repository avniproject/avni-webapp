package org.openchs.dao;

import org.openchs.domain.ProgramOutcome;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "programOutcome", path = "programOutcome")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface ProgramOutcomeRepository extends PagingAndSortingRepository<ProgramOutcome, Long>, CHSRepository<ProgramOutcome>, FindByLastModifiedDateTime<ProgramOutcome> {
}