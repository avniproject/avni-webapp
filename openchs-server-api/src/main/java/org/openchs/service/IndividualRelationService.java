package org.openchs.service;

import org.openchs.dao.GenderRepository;
import org.openchs.dao.individualRelationship.IndividualRelationGenderMappingRepository;
import org.openchs.dao.individualRelationship.IndividualRelationRepository;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.domain.individualRelationship.IndividualRelationGenderMapping;
import org.openchs.util.BadRequestError;
import org.openchs.web.request.GenderContract;
import org.openchs.web.request.IndividualRelationContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IndividualRelationService {

    private IndividualRelationRepository individualRelationRepository;
    private IndividualRelationGenderMappingRepository genderMappingRepository;
    private GenderRepository genderRepository;

    @Autowired
    public IndividualRelationService(IndividualRelationRepository individualRelationRepository, IndividualRelationGenderMappingRepository genderMappingRepository, GenderRepository genderRepository) {
        this.individualRelationRepository = individualRelationRepository;
        this.genderMappingRepository = genderMappingRepository;
        this.genderRepository = genderRepository;
    }

    public List<IndividualRelationContract> getAll() {
        List<IndividualRelation> individualRelations = individualRelationRepository.findAll();
        return individualRelations
                .stream()
                .map(this::toResponseObject)
                .collect(Collectors.toList());
    }

    public IndividualRelation saveRelation(IndividualRelationContract individualRelationContract) {
        String name = individualRelationContract.getName();
        assertNoExistingRelation(name);
        IndividualRelation relation = createRelation(name);
        saveGenderMappings(individualRelationContract, relation);
        return relation;
    }

    public void uploadRelation(IndividualRelationContract individualRelationContract) {
        String name = individualRelationContract.getName();
        IndividualRelation individualRelation = individualRelationRepository.findByName(name);
        if (individualRelation == null) {
            individualRelation = new IndividualRelation();
            individualRelation.setName(name);
            String uuid = individualRelationContract.getUuid();
            individualRelation.setUuid(uuid == null ? UUID.randomUUID().toString() : uuid);
        }
        IndividualRelation savedRelation = individualRelationRepository.save(individualRelation);
        saveGenderMappings(individualRelationContract, savedRelation);
    }

    public IndividualRelationContract toResponseObject(IndividualRelation relation) {
        return new IndividualRelationContract(
                relation.getId(),
                relation.getName(),
                relation.getUuid(),
                relation.isVoided(),
                getGenders(relation)
        );
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


    public void saveGenderMappings(IndividualRelationContract individualRelationContract, IndividualRelation relation) {
        List<IndividualRelationGenderMapping> existingMappings = genderMappingRepository.findAllByRelation(relation);
        List<IndividualRelationGenderMapping> newMappings = new ArrayList<>();
        List<GenderContract> genders = individualRelationContract.getGenders();

        existingMappings.forEach(existingMapping -> {
            boolean shouldKeepMapping = genders.stream().anyMatch(genderContract -> genderContract.getName().equals(existingMapping.getGender().getName()));
            existingMapping.setVoided(!shouldKeepMapping);
        });

        genders.forEach(genderContract -> {
            List<IndividualRelationGenderMapping> matchingMappings = existingMappings.stream().filter(
                    genderMapping -> genderMapping.getGender().getName().equals(genderContract.getName()))
                    .collect(Collectors.toList());
            if (matchingMappings.size() > 0) {
                IndividualRelationGenderMapping matchingMapping = matchingMappings.get(0);
                matchingMapping.setVoided(false);
            } else {
                IndividualRelationGenderMapping mapping = new IndividualRelationGenderMapping(
                        relation,
                        genderRepository.findByName(genderContract.getName())
                );
                mapping.assignUUID();
                newMappings.add(mapping);
            }
        });

        existingMappings.forEach(genderMapping -> genderMappingRepository.save(genderMapping));
        newMappings.forEach(genderMapping -> genderMappingRepository.save(genderMapping));
    }

    private IndividualRelation createRelation(String name) {
        IndividualRelation individualRelation = new IndividualRelation();
        individualRelation.setName(name);
        individualRelation.assignUUID();
        individualRelationRepository.save(individualRelation);
        return individualRelation;
    }

    private void assertNoExistingRelation(String name) {
        IndividualRelation existingRelation = individualRelationRepository.findByNameIgnoreCase(name);
        if (existingRelation != null) {
            throw new BadRequestError(String.format("Relation %s already exists", name));
        }
    }
}
