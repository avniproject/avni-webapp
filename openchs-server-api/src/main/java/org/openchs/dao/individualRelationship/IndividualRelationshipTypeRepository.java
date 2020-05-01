package org.openchs.dao.individualRelationship;

import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.domain.individualRelationship.IndividualRelationshipType;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelationshipType", path = "individualRelationshipType")
public interface IndividualRelationshipTypeRepository extends ReferenceDataRepository<IndividualRelationshipType>, FindByLastModifiedDateTime<IndividualRelationshipType> {
    IndividualRelationshipType findByIndividualAIsToBAndIndividualBIsToA(IndividualRelation individualRelation, IndividualRelation reverseRelation);
}
