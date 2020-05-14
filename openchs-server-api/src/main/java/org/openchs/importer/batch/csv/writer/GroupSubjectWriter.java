package org.openchs.importer.batch.csv.writer;

import org.openchs.dao.GroupRoleRepository;
import org.openchs.dao.GroupSubjectRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.individualRelationship.IndividualRelationGenderMappingRepository;
import org.openchs.dao.individualRelationship.IndividualRelationRepository;
import org.openchs.dao.individualRelationship.IndividualRelationshipRepository;
import org.openchs.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.openchs.domain.GroupRole;
import org.openchs.domain.GroupSubject;
import org.openchs.domain.Individual;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.domain.individualRelationship.IndividualRelationship;
import org.openchs.domain.individualRelationship.IndividualRelationshipType;
import org.openchs.importer.batch.csv.writer.header.GroupMemberHeaders;
import org.openchs.importer.batch.csv.writer.header.HouseholdMemberHeaders;
import org.openchs.importer.batch.model.Row;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class GroupSubjectWriter implements ItemWriter<Row>, Serializable {
    private final GroupSubjectRepository groupSubjectRepository;
    private final GroupRoleRepository groupRoleRepository;
    private final IndividualRepository individualRepository;
    private final IndividualRelationRepository individualRelationRepository;
    private final IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    private final IndividualRelationGenderMappingRepository individualRelationGenderMappingRepository;
    private final IndividualRelationshipRepository individualRelationshipRepository;

    private final GroupMemberHeaders groupMemberHeaders = new GroupMemberHeaders();
    private final HouseholdMemberHeaders householdMemberHeaders = new HouseholdMemberHeaders();

    @Autowired
    public GroupSubjectWriter(GroupSubjectRepository groupSubjectRepository, GroupRoleRepository groupRoleRepository, IndividualRepository individualRepository, IndividualRelationRepository individualRelationRepository, IndividualRelationshipTypeRepository individualRelationshipTypeRepository, IndividualRelationGenderMappingRepository individualRelationGenderMappingRepository, IndividualRelationshipRepository individualRelationshipRepository) {
        this.groupSubjectRepository = groupSubjectRepository;
        this.groupRoleRepository = groupRoleRepository;
        this.individualRepository = individualRepository;
        this.individualRelationRepository = individualRelationRepository;
        this.individualRelationshipTypeRepository = individualRelationshipTypeRepository;
        this.individualRelationGenderMappingRepository = individualRelationGenderMappingRepository;
        this.individualRelationshipRepository = individualRelationshipRepository;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        List<String> allErrorMsgs = new ArrayList<>();

        GroupSubject groupSubject = getOrCreateGroupSubject(row, allErrorMsgs);
        if (allErrorMsgs.size() > 0 || groupSubject == null) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }
        boolean isHousehold = groupSubject.getGroupSubject().getSubjectType().isHousehold();
        IndividualRelation individualRelation;
        IndividualRelationship individualRelationship = null;

        if (isHousehold) {
            groupSubject.setGroupRole(getHouseholdGroupRole(row.getBool(householdMemberHeaders.isHeadOfHousehold), allErrorMsgs, householdMemberHeaders.isHeadOfHousehold));
            if (groupSubject.getGroupRole().getRole().equals("Member")) {
                individualRelation = getRelationWithHeadOfHousehold(row.get(householdMemberHeaders.relationshipWithHeadOfHousehold), allErrorMsgs);
                if (individualRelation != null) {
                    individualRelationship = determineRelationshipWithHeadOfHousehold(groupSubject, individualRelation, allErrorMsgs);
                }
            }
        } else {
            groupSubject.setGroupRole(getGroupRole(row.get(groupMemberHeaders.role), allErrorMsgs, groupMemberHeaders.role));
        }

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        groupSubject.assignUUIDIfRequired();
        groupSubjectRepository.save(groupSubject);
        if (individualRelationship != null) {
            individualRelationship.assignUUIDIfRequired();
            individualRelationshipRepository.save(individualRelationship);
        }
    }

    private GroupSubject getOrCreateGroupSubject(Row row, List<String> errorMsgs) {
        boolean isHouseholdUpload = Arrays.asList(row.getHeaders()).contains(householdMemberHeaders.groupId);
        String groupIdIdentifier = isHouseholdUpload ? householdMemberHeaders.groupId : groupMemberHeaders.groupId;
        String groupId = row.get(groupIdIdentifier);
        String memberId = row.get(groupMemberHeaders.memberId);

        Individual existingGroup;
        Individual existingMember;
        GroupSubject existingGroupSubject;

        if (groupId == null || groupId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is mandatory", groupIdIdentifier));
            return null;
        }
        if (memberId == null || memberId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is mandatory", groupMemberHeaders.memberId));
            return null;
        }

        existingGroup = individualRepository.findByLegacyId(groupId);
        if (existingGroup == null) {
            errorMsgs.add(String.format("Could not find '%s' - '%s'", groupIdIdentifier, groupId));
            return null;
        }
        existingMember = individualRepository.findByLegacyId(memberId);
        if (existingMember == null) {
            errorMsgs.add(String.format("Could not find '%s' - '%s'", groupMemberHeaders.memberId, memberId));
            return null;
        }
        existingGroupSubject = groupSubjectRepository.findByGroupSubjectAndMemberSubject(existingGroup, existingMember);

        return existingGroupSubject == null ? createNewGroupSubject(existingGroup, existingMember, errorMsgs) : existingGroupSubject;
    }

    private GroupSubject createNewGroupSubject(Individual group, Individual member, List<String> errorMsgs) {
        if (!group.getSubjectType().isGroup()) {
            errorMsgs.add(String.format("Group Id '%s' is not of type group", group.getLegacyId()));
            return null;
        }
        GroupSubject groupSubject = new GroupSubject();

        groupSubject.setGroupSubject(group);
        groupSubject.setMemberSubject(member);
        return groupSubject;
    }

    public GroupRole getGroupRole(String role, List<String> errorMsgs, String roleIdentifier) {
        if (role == null || role.isEmpty()) {
            errorMsgs.add(String.format("'%s' field is required", roleIdentifier));
            return null;
        }
        GroupRole groupRole = groupRoleRepository.findByRoleAndIsVoidedFalse(role);
        if (groupRole == null) { // || groupRole.isVoided()) {
            errorMsgs.add(String.format("'%s' role not found", role));
            return null;
        }
        return groupRole;
    }

    public GroupRole getHouseholdGroupRole(Boolean isHeadOfHousehold, List<String> errorMsgs, String isHeadOfHouseholdIdentifier) {
        if (isHeadOfHousehold == null) {
            errorMsgs.add(String.format("'%s' field is required", isHeadOfHouseholdIdentifier));
            return null;
        }

        String roleIdentifier = isHeadOfHousehold ? "Head of household" : "Member";
        return groupRoleRepository.findByRole(roleIdentifier);
    }

    private IndividualRelation getRelationWithHeadOfHousehold(String relationshipWithHeadOfHousehold, List<String> errorMsgs) {
        if (relationshipWithHeadOfHousehold == null || relationshipWithHeadOfHousehold.isEmpty()) {
            errorMsgs.add(String.format("'%s' is mandatory for household members", householdMemberHeaders.relationshipWithHeadOfHousehold));
            return null;
        }
        IndividualRelation individualRelation = individualRelationRepository.findByNameIgnoreCase(relationshipWithHeadOfHousehold);
        if (individualRelation == null || individualRelation.isVoided()) {
            errorMsgs.add(String.format("Invalid relation to head of household '%s'", relationshipWithHeadOfHousehold));
            return null;
        }
        return individualRelation;
    }

    private IndividualRelationship determineRelationshipWithHeadOfHousehold(GroupSubject groupSubject, IndividualRelation individualRelation, List<String> errorMsgs) {
        GroupSubject headOfHouseholdGroupSubject = groupSubjectRepository.findByGroupSubjectAndGroupRole(groupSubject.getGroupSubject(), groupRoleRepository.findByRole("Head of household"));
        Individual headOfHousehold = headOfHouseholdGroupSubject.getMemberSubject();
        IndividualRelationship individualRelationship = new IndividualRelationship();
        individualRelationship.setIndividuala(headOfHousehold);
        individualRelationship.setIndividualB(groupSubject.getMemberSubject());

        List<IndividualRelationshipType> possibleRelationshipTypesList = individualRelationshipTypeRepository.findAllByIndividualBIsToA(individualRelation);
        if (possibleRelationshipTypesList == null || possibleRelationshipTypesList.isEmpty()) {
            errorMsgs.add(String.format("Could not find RelationshipType with Individual B Relation '%s'", individualRelation.getName()));
            return null;
        }
        Stream<IndividualRelationshipType> possibleRelationshipTypesStream = possibleRelationshipTypesList.stream();
        if (possibleRelationshipTypesStream.count() > 1) {
            List<String> possibleHeadRelationNames = individualRelationGenderMappingRepository.findAllByGender(headOfHousehold.getGender())
                    .stream()
                    .map(individualRelationGenderMapping -> individualRelationGenderMapping.getRelation().getName())
                    .collect(Collectors.toList());

            List<IndividualRelationshipType> filteredRelationshipTypes = new ArrayList<>();
            possibleRelationshipTypesStream.forEach(possibleRelationshipType -> {
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
