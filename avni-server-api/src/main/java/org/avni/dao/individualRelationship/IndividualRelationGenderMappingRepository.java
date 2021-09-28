package org.avni.dao.individualRelationship;

import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.ReferenceDataRepository;
import org.avni.domain.Gender;
import org.avni.domain.individualRelationship.IndividualRelation;
import org.avni.domain.individualRelationship.IndividualRelationGenderMapping;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelationGenderMapping", path = "individualRelationGenderMapping")
public interface IndividualRelationGenderMappingRepository extends ReferenceDataRepository<IndividualRelationGenderMapping>, FindByLastModifiedDateTime<IndividualRelationGenderMapping> {
    default IndividualRelationGenderMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in IndividualRelationGenderMapping");
    }

    default IndividualRelationGenderMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in IndividualRelationGenderMapping");
    }

    List<IndividualRelationGenderMapping> findAllByRelation(IndividualRelation relation);

    IndividualRelationGenderMapping findByRelationAndIsVoidedFalse(IndividualRelation relation);

    List<IndividualRelationGenderMapping> findAllByGender(Gender gender);
}
