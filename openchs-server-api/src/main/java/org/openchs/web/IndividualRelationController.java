package org.openchs.web;

import org.openchs.dao.GenderRepository;
import org.openchs.dao.individualRelationship.IndividualRelationGenderMappingRepository;
import org.openchs.dao.individualRelationship.IndividualRelationRepository;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.domain.individualRelationship.IndividualRelationGenderMapping;
import org.openchs.util.ApiException;
import org.openchs.web.request.GenderContract;
import org.openchs.web.request.IndividualRelationContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public List<IndividualRelationContract> getAllIndividualRelations() {
        List<IndividualRelation> individualRelations = individualRelationRepository.findAll();
        return individualRelations
                .stream()
                .map(this::toResponseObject)
                .collect(Collectors.toList());
    }

    @GetMapping(value = "/web/relation/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public ResponseEntity<IndividualRelationContract> getIndividualRelation(@PathVariable Long id) {
        Optional<IndividualRelation> relation = individualRelationRepository.findById(id);
        return relation.map(individualRelation ->
                ResponseEntity.ok(toResponseObject(individualRelation)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/web/relation")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void newIndividualRelation(@RequestBody IndividualRelationContract individualRelationContract) {
        String name = individualRelationContract.getName();
        assertNoExistingRelation(name);
        IndividualRelation relation = createRelation(name);
        saveGenderMappings(individualRelationContract, relation);
    }

    @PostMapping(value = "/web/relation/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity saveIndividualRelation(@PathVariable Long id, @RequestBody IndividualRelationContract individualRelationContract) {
        Optional<IndividualRelation> relation = individualRelationRepository.findById(id);
        if (!relation.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        IndividualRelation individualRelation = relation.get();
        individualRelation.setName(individualRelationContract.getName());
        saveGenderMappings(individualRelationContract, individualRelation);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping(value = "/web/relation/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void deleteIndividualRelation(@PathVariable Long id) {
        Optional<IndividualRelation> relation = individualRelationRepository.findById(id);
        if (relation.isPresent()) {
            IndividualRelation individualRelation = relation.get();
            individualRelation.setVoided(true);
            individualRelationRepository.save(individualRelation);
        }
    }

    private IndividualRelationContract toResponseObject(IndividualRelation relation) {
        return new IndividualRelationContract(
                        relation.getId(),
                        relation.getName(),
                        relation.getUuid(),
                        getGenders(relation));
    }

    private void saveGenderMappings(IndividualRelationContract individualRelationContract, IndividualRelation relation) {
        List<IndividualRelationGenderMapping> existingMappings = genderMappingRepository.findAllByRelation(relation);
        List<GenderContract> genders = individualRelationContract.getGenders();

        existingMappings.forEach(existingMapping -> {
            if (genders.stream().anyMatch(genderContract -> genderContract.getName().equals(existingMapping.getGender().getName()))) {
                existingMapping.setVoided(false);
            } else {
                existingMapping.setVoided(true);
            }
            genderMappingRepository.save(existingMapping);
        });

        genders.forEach(genderContract -> {
            List<IndividualRelationGenderMapping> matchingMappings = existingMappings.stream().filter(
                    genderMapping -> genderMapping.getGender().getName().equals(genderContract.getName()))
                    .collect(Collectors.toList());
            if (matchingMappings.size() > 0) {
                IndividualRelationGenderMapping matchingMapping = matchingMappings.get(0);
                matchingMapping.setVoided(false);
                genderMappingRepository.save(matchingMapping);
            } else {
                IndividualRelationGenderMapping mapping = new IndividualRelationGenderMapping(
                        relation,
                        genderRepository.findByName(genderContract.getName())
                );
                mapping.assignUUID();
                genderMappingRepository.save(mapping);
            }
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
                .filter(genderMapping -> !genderMapping.isVoided())
                .map(genderMapping -> new GenderContract(
                        genderMapping.getGender().getUuid(),
                        genderMapping.getGender().getName()))
                .collect(Collectors.toList());
    }
}
