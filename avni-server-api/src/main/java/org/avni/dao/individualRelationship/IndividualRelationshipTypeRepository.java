package org.avni.dao.individualRelationship;

import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.ReferenceDataRepository;
import org.avni.domain.individualRelationship.IndividualRelation;
import org.avni.domain.individualRelationship.IndividualRelationshipType;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelationshipType", path = "individualRelationshipType")
public interface IndividualRelationshipTypeRepository extends ReferenceDataRepository<IndividualRelationshipType>, FindByLastModifiedDateTime<IndividualRelationshipType> {
    IndividualRelationshipType findByIndividualAIsToBAndIndividualBIsToA(IndividualRelation individualRelation, IndividualRelation reverseRelation);

    List<IndividualRelationshipType> findAllByIndividualBIsToA(IndividualRelation reverseRelation);
}
