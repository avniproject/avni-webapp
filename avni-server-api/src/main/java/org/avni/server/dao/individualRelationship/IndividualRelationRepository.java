package org.avni.server.dao.individualRelationship;

import org.avni.server.dao.FindByLastModifiedDateTime;
import org.avni.server.dao.ReferenceDataRepository;
import org.avni.server.domain.individualRelationship.IndividualRelation;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelation", path = "individualRelation")
public interface IndividualRelationRepository extends ReferenceDataRepository<IndividualRelation>, FindByLastModifiedDateTime<IndividualRelation> {
}
