package org.openchs.web;

import org.openchs.dao.GenderRepository;
import org.openchs.dao.individualRelationship.IndividualRelationGenderMappingRepository;
import org.openchs.dao.individualRelationship.IndividualRelationRepository;
import org.openchs.domain.Gender;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.domain.individualRelationship.IndividualRelationGenderMapping;
import org.openchs.util.ApiException;
import org.openchs.web.request.GenderContract;
import org.openchs.web.request.IndividualRelationContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
public class IndividualRelationController {

    private IndividualRelationRepository individualRelationRepository;
    private IndividualRelationGenderMappingRepository genderMappingRepository;
    private GenderRepository genderRepository;

    @Autowired
    public IndividualRelationController(IndividualRelationRepository individualRelationRepository,
                                        IndividualRelationGenderMappingRepository genderMappingRepository, GenderRepository genderRepository) {
        this.individualRelationRepository = individualRelationRepository;
        this.genderMappingRepository = genderMappingRepository;
        this.genderRepository = genderRepository;
    }

    @GetMapping(value = "/web/relation")
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

    @PostMapping(value = "/web/relation")
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void saveIndividualRelation(@RequestBody IndividualRelationContract individualRelationContract) {
        String name = individualRelationContract.getName();
        assertNoExistingRelation(name);
        IndividualRelation relation = createRelation(name);
        saveGenderMappings(individualRelationContract, relation);
    }

    private void saveGenderMappings(IndividualRelationContract individualRelationContract, IndividualRelation relation) {
        individualRelationContract.getGenders()
                .stream()
                .forEach(genderContract -> {
                    genderMappingRepository.save(
                            new IndividualRelationGenderMapping(
                                    relation,
                                    genderRepository.findByName(genderContract.getName())
                            ));
                });
    }

    private IndividualRelation createRelation(String name) {
        IndividualRelation individualRelation = new IndividualRelation();
        individualRelation.setName(name);
        individualRelation.assignUUID();
        individualRelationRepository.save(individualRelation);
        return individualRelation;
    }

    private void assertNoExistingRelation(String name) {
        IndividualRelation existingRelation = individualRelationRepository.findByName(name);
        if (existingRelation != null) {
            throw new ApiException(String.format("Relation %s already exists", name));
        }
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
