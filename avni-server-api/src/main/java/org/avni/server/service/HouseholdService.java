package org.avni.server.service;

import org.avni.server.dao.GroupRoleRepository;
import org.avni.server.dao.GroupSubjectRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationGenderMappingRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.avni.server.domain.GroupSubject;
import org.avni.server.domain.Individual;
import org.avni.server.domain.individualRelationship.IndividualRelation;
import org.avni.server.domain.individualRelationship.IndividualRelationGenderMapping;
import org.avni.server.domain.individualRelationship.IndividualRelationship;
import org.avni.server.domain.individualRelationship.IndividualRelationshipType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HouseholdService {

    private GroupSubjectRepository groupSubjectRepository;
    private GroupRoleRepository groupRoleRepository;
    private IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    private IndividualRelationGenderMappingRepository individualRelationGenderMappingRepository;

    @Autowired
    public HouseholdService(GroupSubjectRepository groupSubjectRepository, GroupRoleRepository groupRoleRepository, IndividualRelationshipTypeRepository individualRelationshipTypeRepository, IndividualRelationGenderMappingRepository individualRelationGenderMappingRepository) {
        this.groupSubjectRepository = groupSubjectRepository;
        this.groupRoleRepository = groupRoleRepository;
        this.individualRelationshipTypeRepository = individualRelationshipTypeRepository;
        this.individualRelationGenderMappingRepository = individualRelationGenderMappingRepository;
    }

    public IndividualRelationship determineRelationshipWithHeadOfHousehold(GroupSubject groupSubject, IndividualRelation individualRelation, List<String> errorMsgs) {
        List<IndividualRelationGenderMapping> individualRelationGenderMappings = individualRelationGenderMappingRepository.findByRelationAndIsVoidedFalse(individualRelation);

        if (individualRelationGenderMappings == null) {
            errorMsgs.add(String.format("Gender mapping for relation '%s' is not defined", individualRelation.getName()));
            return null;
        }
        Individual memberSubject = groupSubject.getMemberSubject();
        if (memberSubject.getGender() == null) {
            errorMsgs.add(String.format("Member gender is not defined and cannot be added as '%s'", individualRelation.getName()));
            return null;
        }

        if (individualRelationGenderMappings.stream().noneMatch(individualRelationGenderMapping -> individualRelationGenderMapping.genderMatches(memberSubject.getGender()))) {
            errorMsgs.add(String.format("Member cannot be added as '%s' since they were registered as '%s'", individualRelation.getName(), memberSubject.getGender().getName()));
            return null;
        }

        Individual headOfHousehold = getHeadOfHouseholdForGroupSubject(groupSubject);
        if (headOfHousehold == null) {
            errorMsgs.add(String.format("Head of household not yet defined for Household id '%s'. Cannot add member.", groupSubject.getGroupSubject().getLegacyId()));
            return null;
        }
        IndividualRelationship individualRelationship = new IndividualRelationship();
        individualRelationship.setIndividuala(headOfHousehold);
        individualRelationship.setIndividualB(memberSubject);

        List<IndividualRelationshipType> possibleRelationshipTypesList = individualRelationshipTypeRepository.findAllByIndividualBIsToA(individualRelation);
        if (possibleRelationshipTypesList == null || possibleRelationshipTypesList.isEmpty()) {
            errorMsgs.add(String.format("Could not find RelationshipType with Individual B Relation '%s'", individualRelation.getName()));
            return null;
        }
        if (possibleRelationshipTypesList.size() > 1) {
            List<String> possibleHeadRelationNames = individualRelationGenderMappingRepository.findAllByGender(headOfHousehold.getGender())
                    .stream()
                    .map(possibleGenderMappings -> possibleGenderMappings.getRelation().getName())
                    .collect(Collectors.toList());

            List<IndividualRelationshipType> filteredRelationshipTypes = new ArrayList<>();
            possibleRelationshipTypesList.forEach(possibleRelationshipType -> {
                if (possibleHeadRelationNames.contains(possibleRelationshipType.getIndividualAIsToB().getName())) {
                    filteredRelationshipTypes.add(possibleRelationshipType);
                }
            });
            if (filteredRelationshipTypes.size() != 1) {
                errorMsgs.add(String.format("Indeterminate relationship type '%s' to link to head of household", individualRelation.getName()));
                return null;
            } else {
                individualRelationship.setRelationship(filteredRelationshipTypes.get(0));
            }
        } else {
            individualRelationship.setRelationship(possibleRelationshipTypesList.get(0));
        }
        return individualRelationship;
    }

    public Individual getHeadOfHouseholdForGroupSubject(GroupSubject groupSubject) {
        GroupSubject headOfHouseholdGroupSubject = groupSubjectRepository.findByGroupSubjectAndGroupRoleAndIsVoidedFalse(groupSubject.getGroupSubject(), groupRoleRepository.findByRoleAndGroupSubjectTypeIdAndIsVoidedFalse("Head of household", groupSubject.getGroupSubject().getSubjectType().getId()));
        return (headOfHouseholdGroupSubject == null) ? null : headOfHouseholdGroupSubject.getMemberSubject();
    }
}
