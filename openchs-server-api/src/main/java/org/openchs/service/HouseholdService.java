package org.openchs.service;

import org.openchs.dao.GroupRoleRepository;
import org.openchs.dao.GroupSubjectRepository;
import org.openchs.dao.individualRelationship.IndividualRelationGenderMappingRepository;
import org.openchs.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.openchs.domain.GroupSubject;
import org.openchs.domain.Individual;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.domain.individualRelationship.IndividualRelationGenderMapping;
import org.openchs.domain.individualRelationship.IndividualRelationship;
import org.openchs.domain.individualRelationship.IndividualRelationshipType;
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
        GroupSubject headOfHouseholdGroupSubject = groupSubjectRepository.findByGroupSubjectAndGroupRoleAndIsVoidedFalse(groupSubject.getGroupSubject(), groupRoleRepository.findByRoleAndGroupSubjectTypeIdAndIsVoidedFalse("Head of household", groupSubject.getGroupSubject().getSubjectType().getId()));
        IndividualRelationGenderMapping individualRelationGenderMapping = individualRelationGenderMappingRepository.findByRelationAndIsVoidedFalse(individualRelation);

        if (individualRelationGenderMapping == null) {
            errorMsgs.add(String.format("Gender mapping for relation '%s' is not defined", individualRelation.getName()));
            return null;
        }
        Individual memberSubject = groupSubject.getMemberSubject();
        if (!(individualRelationGenderMapping.getGender().getName().equals(memberSubject.getGender().getName()))) {
            errorMsgs.add(String.format("Member cannot be added as '%s' since they were registered as '%s'", individualRelation.getName(), memberSubject.getGender().getName()));
            return null;
        }
        if (headOfHouseholdGroupSubject == null) {
            errorMsgs.add(String.format("Head of household not yet defined for Household id '%s'", groupSubject.getGroupSubject().getLegacyId()));
            return null;
        }
        Individual headOfHousehold = headOfHouseholdGroupSubject.getMemberSubject();
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
}
