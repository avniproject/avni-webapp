package org.openchs.dao.individualRelationship;

import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelation", path = "individualRelation")
public interface IndividualRelationRepository extends ReferenceDataRepository<IndividualRelation>, FindByLastModifiedDateTime<IndividualRelation> {
}