package org.avni.server.dao.individualRelationship;

import org.avni.server.dao.FindByLastModifiedDateTime;
import org.avni.server.dao.ReferenceDataRepository;
import org.avni.server.domain.Gender;
import org.avni.server.domain.individualRelationship.IndividualRelation;
import org.avni.server.domain.individualRelationship.IndividualRelationGenderMapping;
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

    List<IndividualRelationGenderMapping> findByRelationAndIsVoidedFalse(IndividualRelation relation);

    List<IndividualRelationGenderMapping> findAllByGender(Gender gender);
}
