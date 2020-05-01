package org.openchs.web;

import org.openchs.dao.individualRelationship.IndividualRelationRepository;
import org.openchs.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.domain.individualRelationship.IndividualRelationshipType;
import org.openchs.web.request.IndividualRelationshipTypeContract;
import org.openchs.web.request.webapp.IndividualRelationContract;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
public class IndividualRelationshipTypeController {

    private IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    private IndividualRelationRepository individualRelationRepository;

    public IndividualRelationshipTypeController(IndividualRelationshipTypeRepository individualRelationshipTypeRepository,
                                                IndividualRelationRepository individualRelationRepository) {
        this.individualRelationshipTypeRepository = individualRelationshipTypeRepository;
        this.individualRelationRepository = individualRelationRepository;
    }

    @GetMapping(value = "/web/relationshipType")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public List<IndividualRelationshipTypeContract> getAllIndividualRelationshipTypes() {
        List<IndividualRelationshipType> relationshipTypes = individualRelationshipTypeRepository.findAll();
        return relationshipTypes
                .stream()
                .map(this::createIndividualRelationshipTypeContract)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @PostMapping(value = "/web/relationshipType")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void newRelationshipType(@RequestBody IndividualRelationshipTypeContract relationshipTypeContract) {
        Long aToBId = relationshipTypeContract.getIndividualAIsToBRelation().getId();
        Long bToAId = relationshipTypeContract.getIndividualBIsToARelation().getId();
        IndividualRelation aToB = individualRelationRepository.findOne(aToBId);
        IndividualRelation bToA = individualRelationRepository.findOne(bToAId);
        IndividualRelationshipType existingRow = individualRelationshipTypeRepository
                .findByIndividualAIsToBAndIndividualBIsToA(aToB, bToA);
        if (existingRow == null) {
            createIndividualRelationshipType(aToB, bToA);
        } else {
            existingRow.setVoided(false);
            individualRelationshipTypeRepository.save(existingRow);
        }
    }

    @DeleteMapping(value = "/web/relationshipType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void deleteIndividualRelationshipType(@PathVariable Long id) {
        IndividualRelationshipType individualRelationshipType = individualRelationshipTypeRepository.findOne(id);
        if (individualRelationshipType != null) {
            individualRelationshipType.setVoided(true);
            individualRelationshipTypeRepository.save(individualRelationshipType);
        }
    }

    private void createIndividualRelationshipType(IndividualRelation aToB, IndividualRelation bToA) {
        IndividualRelationshipType individualRelationshipType = new IndividualRelationshipType();
        individualRelationshipType.setName(String.format("%s-%s", aToB.getName(), bToA.getName()));
        individualRelationshipType.setIndividualAIsToB(aToB);
        individualRelationshipType.setIndividualBIsToA(bToA);
        individualRelationshipTypeRepository.save(individualRelationshipType);
    }

    private IndividualRelationshipTypeContract createIndividualRelationshipTypeContract(IndividualRelationshipType relationshipType) {
        if (relationshipType.isVoided()) {
            return null;
        }
        IndividualRelationshipTypeContract individualRelationshipTypeContract = new IndividualRelationshipTypeContract();
        individualRelationshipTypeContract.setId(relationshipType.getId());
        individualRelationshipTypeContract.setUuid(relationshipType.getUuid());
        individualRelationshipTypeContract.setVoided(relationshipType.isVoided());
        individualRelationshipTypeContract.setIndividualAIsToBRelation(createIndividualRelationContract(relationshipType.getIndividualAIsToB()));
        individualRelationshipTypeContract.setIndividualBIsToARelation(createIndividualRelationContract(relationshipType.getIndividualBIsToA()));
        return individualRelationshipTypeContract;
    }

    private IndividualRelationContract createIndividualRelationContract(IndividualRelation relation) {
        IndividualRelationContract individualAIsToBRelation = new IndividualRelationContract();
        individualAIsToBRelation.setId(relation.getId());
        individualAIsToBRelation.setUuid(relation.getUuid());
        individualAIsToBRelation.setName(relation.getName());
        return individualAIsToBRelation;
    }
}
