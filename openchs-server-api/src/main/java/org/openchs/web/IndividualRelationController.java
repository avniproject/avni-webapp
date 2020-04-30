package org.openchs.web;

import org.openchs.dao.individualRelationship.IndividualRelationGenderMappingRepository;
import org.openchs.dao.individualRelationship.IndividualRelationRepository;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.web.request.GenderContract;
import org.openchs.web.request.IndividualRelationContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class IndividualRelationController {

    private IndividualRelationRepository individualRelationRepository;
    private IndividualRelationGenderMappingRepository genderMappingRepository;

    @Autowired
    public IndividualRelationController(IndividualRelationRepository individualRelationRepository,
                                        IndividualRelationGenderMappingRepository genderMappingRepository) {
        this.individualRelationRepository = individualRelationRepository;
        this.genderMappingRepository = genderMappingRepository;
    }

    @GetMapping(value = "/web/relations")
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin', 'organisation_admin')")
    @ResponseBody
    public List<IndividualRelationContract> getAllIndividualRelations() {
        List<IndividualRelation> individualRelations = individualRelationRepository.findAll();
        return individualRelations.stream().map(relation ->
                new IndividualRelationContract(
                        relation.getId(),
                        relation.getName(),
                        relation.getUuid(),
                        getGenders(relation)))
                .collect(Collectors.toList());
    }

    private List<GenderContract> getGenders(IndividualRelation relation) {
        return genderMappingRepository
                .findAllByRelation(relation)
                .stream()
                .map(genderMapping -> new GenderContract(
                        genderMapping.getGender().getUuid(),
                        genderMapping.getGender().getName()))
                .collect(Collectors.toList());
    }
}
