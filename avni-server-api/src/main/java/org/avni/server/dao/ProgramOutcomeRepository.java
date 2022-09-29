package org.avni.server.dao;

import org.avni.server.domain.ProgramOutcome;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "programOutcome", path = "programOutcome")
public interface ProgramOutcomeRepository extends TransactionalDataRepository<ProgramOutcome>, FindByLastModifiedDateTime<ProgramOutcome> {
}
