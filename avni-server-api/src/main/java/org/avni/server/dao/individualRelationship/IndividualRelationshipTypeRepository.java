package org.avni.server.dao.individualRelationship;

import org.avni.server.dao.FindByLastModifiedDateTime;
import org.avni.server.dao.ReferenceDataRepository;
import org.avni.server.domain.individualRelationship.IndividualRelation;
import org.avni.server.domain.individualRelationship.IndividualRelationshipType;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelationshipType", path = "individualRelationshipType")
public interface IndividualRelationshipTypeRepository extends ReferenceDataRepository<IndividualRelationshipType>, FindByLastModifiedDateTime<IndividualRelationshipType> {
    IndividualRelationshipType findByIndividualAIsToBAndIndividualBIsToA(IndividualRelation individualRelation, IndividualRelation reverseRelation);

    List<IndividualRelationshipType> findAllByIndividualBIsToA(IndividualRelation reverseRelation);
}
