package org.openchs.web;

import org.openchs.dao.IndividualRelationshipRepository;
import org.openchs.dao.IndividualRelationshipTypeRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Individual;
import org.openchs.domain.IndividualRelationship;
import org.openchs.domain.IndividualRelationshipType;
import org.openchs.web.request.IndividualRelationshipRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class IndividualRelationshipController extends AbstractController<IndividualRelationship> {
    private final IndividualRepository individualRepository;
    private final IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    private final IndividualRelationshipRepository individualRelationshipRepository;

    @Autowired
    public IndividualRelationshipController(IndividualRelationshipRepository individualRelationshipRepository, IndividualRepository individualRepository, IndividualRelationshipTypeRepository individualRelationshipTypeRepository) {
        this.individualRelationshipRepository = individualRelationshipRepository;
        this.individualRepository = individualRepository;
        this.individualRelationshipTypeRepository = individualRelationshipTypeRepository;
    }

    @RequestMapping(value = "/individualRelationships", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    @Transactional
    public void save(@RequestBody IndividualRelationshipRequest request) {
        IndividualRelationshipType relationshipType = individualRelationshipTypeRepository.findByUuid(request.getRelationshipTypeUUID());
        Individual individualA = individualRepository.findByUuid(request.getIndividualAUUID());
        Individual individualB = individualRepository.findByUuid(request.getIndividualBUUID());

        IndividualRelationship individualRelationship = newOrExistingEntity(individualRelationshipRepository, request, new IndividualRelationship());
        individualRelationship.setIndividuala(individualA);
        individualRelationship.setRelationship(relationshipType);
        individualRelationship.setIndividualB(individualB);
        individualRelationship.setEnterDateTime(request.getEnterDateTime());
        individualRelationship.setExitDateTime(request.getExitDateTime());
        individualRelationship.setVoided(request.isVoided());

        individualRelationshipRepository.save(individualRelationship);
    }
}