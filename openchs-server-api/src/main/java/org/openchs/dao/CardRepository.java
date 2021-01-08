package org.openchs.dao;

import org.openchs.domain.Card;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "card", path = "card")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface CardRepository extends ReferenceDataRepository<Card>, FindByLastModifiedDateTime<Card>, JpaSpecificationExecutor<Card> {


}
