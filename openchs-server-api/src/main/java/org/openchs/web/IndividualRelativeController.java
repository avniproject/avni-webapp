package org.openchs.web;

import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.web.request.IndividualRelativeRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class IndividualRelativeController extends AbstractController<IndividualRelative> {
    private final IndividualRepository individualRepository;
    private final IndividualRelationRepository individualRelationRepository;
    private final IndividualRelativeRepository individualRelativeRepository;

    @Autowired
    public IndividualRelativeController(IndividualRelativeRepository individualRelativeRepository, IndividualRepository individualRepository, IndividualRelationRepository individualRelationRepository) {
        this.individualRelativeRepository = individualRelativeRepository;
        this.individualRepository = individualRepository;
        this.individualRelationRepository = individualRelationRepository;
    }

    @RequestMapping(value = "/individualRelatives", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    @Transactional
    public void save(@RequestBody IndividualRelativeRequest request) {
        IndividualRelation relation = individualRelationRepository.findByUuid(request.getRelationUUID());
        Individual relativeIndividual = individualRepository.findByUuid(request.getRelativeIndividualUUID());

        IndividualRelative individualRelative = newOrExistingEntity(individualRelativeRepository, request, new IndividualRelative());
        individualRelative.setRelation(relation);
        individualRelative.setRelativeIndividual(relativeIndividual);
        individualRelative.setEnterDateTime(request.getEnterDateTime());
        individualRelative.setExitDateTime(request.getExitDateTime());

        if (individualRelative.isNew()) {
            Individual individual = individualRepository.findByUuid(request.getIndividualUUID());
            individualRelative.setIndividual(individual);
            individual.addRelative(individualRelative);
            individualRepository.save(individual);
        } else {
            individualRelativeRepository.save(individualRelative);
        }
    }
}