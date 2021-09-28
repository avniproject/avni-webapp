package org.avni.dao.individualRelationship;

import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.ReferenceDataRepository;
import org.avni.domain.individualRelationship.IndividualRelation;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelation", path = "individualRelation")
public interface IndividualRelationRepository extends ReferenceDataRepository<IndividualRelation>, FindByLastModifiedDateTime<IndividualRelation> {
}
