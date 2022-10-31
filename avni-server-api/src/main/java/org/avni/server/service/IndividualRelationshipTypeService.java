package org.avni.server.service;

import org.avni.server.dao.individualRelationship.IndividualRelationRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.avni.server.domain.individualRelationship.IndividualRelation;
import org.avni.server.domain.individualRelationship.IndividualRelationshipType;
import org.avni.server.web.request.IndividualRelationshipTypeContract;
import org.avni.server.web.request.webapp.IndividualRelationContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IndividualRelationshipTypeService implements NonScopeAwareService {
    private IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    private IndividualRelationRepository individualRelationRepository;

    @Autowired
    public IndividualRelationshipTypeService(IndividualRelationshipTypeRepository individualRelationshipTypeRepository,
                                             IndividualRelationRepository individualRelationRepository) {
        this.individualRelationshipTypeRepository = individualRelationshipTypeRepository;
        this.individualRelationRepository = individualRelationRepository;
    }

    public List<IndividualRelationshipTypeContract> getAllRelationshipTypes() {
        List<IndividualRelationshipType> relationshipTypes = individualRelationshipTypeRepository.findAllByIsVoidedFalse();
        return relationshipTypes
                .stream()
                .map(IndividualRelationshipTypeContract::fromEntity)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public IndividualRelationshipType saveRelationshipType(IndividualRelationshipTypeContract relationshipTypeContract) {
        IndividualRelationContract individualAIsToBRelation = relationshipTypeContract.getIndividualAIsToBRelation();
        IndividualRelationContract individualBIsToARelation = relationshipTypeContract.getIndividualBIsToARelation();
        IndividualRelation aToB = findIndividualRelation(individualAIsToBRelation);
        IndividualRelation bToA = findIndividualRelation(individualBIsToARelation);
        IndividualRelationshipType individualRelationshipType = individualRelationshipTypeRepository
                .findByIndividualAIsToBAndIndividualBIsToA(aToB, bToA);
        if (individualRelationshipType == null) {
            individualRelationshipType = createIndividualRelationshipType(aToB, bToA, relationshipTypeContract.getUuid());
        } else {
            individualRelationshipType.setVoided(false);
        }
        return individualRelationshipTypeRepository.save(individualRelationshipType);
    }

    private IndividualRelation findIndividualRelation(IndividualRelationContract relationContract) {
        return relationContract.getUuid() == null ? individualRelationRepository.findOne(relationContract.getId())
                : individualRelationRepository.findByUuid(relationContract.getUuid());
    }

    private IndividualRelationshipType createIndividualRelationshipType(IndividualRelation aToB, IndividualRelation bToA, String requestUUID) {
        IndividualRelationshipType individualRelationshipType = new IndividualRelationshipType();
        individualRelationshipType.setName(String.format("%s-%s", aToB.getName(), bToA.getName()));
        individualRelationshipType.setIndividualAIsToB(aToB);
        individualRelationshipType.setIndividualBIsToA(bToA);
        individualRelationshipType.setUuid(requestUUID == null ? UUID.randomUUID().toString() : requestUUID);
        individualRelationshipTypeRepository.save(individualRelationshipType);
        return individualRelationshipType;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return individualRelationshipTypeRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
