package org.avni.server.importer.batch.csv.writer;

import org.avni.server.dao.GroupRoleRepository;
import org.avni.server.dao.GroupSubjectRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationshipRepository;
import org.avni.server.domain.GroupRole;
import org.avni.server.domain.GroupSubject;
import org.avni.server.domain.Individual;
import org.avni.server.domain.individualRelationship.IndividualRelation;
import org.avni.server.domain.individualRelationship.IndividualRelationship;
import org.avni.server.importer.batch.csv.creator.DateCreator;
import org.avni.server.importer.batch.csv.writer.header.GroupMemberHeaders;
import org.avni.server.importer.batch.csv.writer.header.HouseholdMemberHeaders;
import org.avni.server.importer.batch.model.Row;
import org.avni.server.service.GroupSubjectService;
import org.avni.server.service.HouseholdService;
import org.joda.time.LocalDate;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Component
public class GroupSubjectWriter implements ItemWriter<Row>, Serializable {
    private final GroupSubjectRepository groupSubjectRepository;
    private final GroupRoleRepository groupRoleRepository;
    private final IndividualRepository individualRepository;
    private final IndividualRelationRepository individualRelationRepository;
    private final IndividualRelationshipRepository individualRelationshipRepository;
    private final HouseholdService householdService;
    private final GroupSubjectService groupSubjectService;

    private DateCreator dateCreator;

    @Autowired
    public GroupSubjectWriter(GroupSubjectRepository groupSubjectRepository,
                              GroupRoleRepository groupRoleRepository,
                              IndividualRepository individualRepository,
                              IndividualRelationRepository individualRelationRepository,
                              IndividualRelationshipRepository individualRelationshipRepository,
                              HouseholdService householdService, GroupSubjectService groupSubjectService) {
        this.groupSubjectRepository = groupSubjectRepository;
        this.groupRoleRepository = groupRoleRepository;
        this.individualRepository = individualRepository;
        this.individualRelationRepository = individualRelationRepository;
        this.individualRelationshipRepository = individualRelationshipRepository;
        this.householdService = householdService;
        this.groupSubjectService = groupSubjectService;
        this.dateCreator = new DateCreator();
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
            Individual existingHeadOfHousehold = householdService.getHeadOfHouseholdForGroupSubject(groupSubject);
            groupSubject.setGroupRole(getHouseholdGroupRole(row.getBool(HouseholdMemberHeaders.isHeadOfHousehold),
                    allErrorMsgs,
                    HouseholdMemberHeaders.isHeadOfHousehold,
                    groupSubject.getGroupSubject().getSubjectType().getId()));
            if (groupSubject.getGroupRole().getRole().equals("Member")) {
                individualRelation = getRelationWithHeadOfHousehold(row.get(HouseholdMemberHeaders.relationshipWithHeadOfHousehold), allErrorMsgs);
                if (individualRelation != null) {
                    individualRelationship = householdService.determineRelationshipWithHeadOfHousehold(groupSubject, individualRelation, allErrorMsgs);
                }
            } else if (groupSubject.getGroupRole().getRole().equals("Head of household")) {
                if (existingHeadOfHousehold != null && !existingHeadOfHousehold.getId().equals(groupSubject.getMemberSubject().getId())) {
                    allErrorMsgs.add(String.format("Member with id '%s' cannot be head of household because another member is already head of household.", groupSubject.getMemberSubject().getLegacyId()));
                }
            }
        } else {
            groupSubject.setGroupRole(getGroupRole(row.get(GroupMemberHeaders.role),
                    allErrorMsgs,
                    GroupMemberHeaders.role,
                    groupSubject.getGroupSubject().getSubjectType().getId()));
        }

        saveMembershipDates(row, groupSubject, allErrorMsgs);

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        groupSubject.assignUUIDIfRequired();
        groupSubjectService.save(groupSubject);
        saveRelationshipWithHeadOfHousehold(individualRelationship);
    }

    private GroupSubject getOrCreateGroupSubject(Row row, List<String> errorMsgs) {
//        boolean isHouseholdUpload = Arrays.asList(row.getHeaders()).contains(householdMemberHeaders.groupId);
//        String groupIdIdentifier = isHouseholdUpload ? householdMemberHeaders.groupId : groupMemberHeaders.groupId;
        String groupIdIdentifier = row.getHeaders()[0];  //hack assumes group id/household id is the first element. Added to handle dynamic group id header values.
        String groupId = row.get(groupIdIdentifier);
        String memberId = row.get(GroupMemberHeaders.memberId);

        Individual existingGroup;
        Individual existingMember;
        GroupSubject existingGroupSubject;

        if (groupId == null || groupId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is mandatory", groupIdIdentifier));
            return null;
        }
        if (memberId == null || memberId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is mandatory", GroupMemberHeaders.memberId));
            return null;
        }

        existingGroup = individualRepository.findByLegacyIdOrUuid(groupId);
        if (existingGroup == null) {
            errorMsgs.add(String.format("Could not find '%s' - '%s'", groupIdIdentifier, groupId));
            return null;
        }
        existingMember = individualRepository.findByLegacyIdOrUuid(memberId);
        if (existingMember == null) {
            errorMsgs.add(String.format("Could not find '%s' - '%s'", GroupMemberHeaders.memberId, memberId));
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

    private GroupRole getGroupRole(String role, List<String> errorMsgs, String roleIdentifier, Long groupSubjectTypeId) {
        if (role == null || role.isEmpty()) {
            errorMsgs.add(String.format("'%s' field is required", roleIdentifier));
            return null;
        }
        GroupRole groupRole = groupRoleRepository.findByRoleAndGroupSubjectTypeIdAndIsVoidedFalse(role, groupSubjectTypeId);
        if (groupRole == null) { // || groupRole.isVoided()) {
            errorMsgs.add(String.format("'%s' role not found", role));
            return null;
        }
        return groupRole;
    }

    private GroupRole getHouseholdGroupRole(Boolean isHeadOfHousehold, List<String> errorMsgs, String isHeadOfHouseholdIdentifier, Long groupSubjectTypeId) {
        if (isHeadOfHousehold == null) {
            errorMsgs.add(String.format("'%s' field is required", isHeadOfHouseholdIdentifier));
            return null;
        }

        String roleIdentifier = isHeadOfHousehold ? "Head of household" : "Member";
        return groupRoleRepository.findByRoleAndGroupSubjectTypeIdAndIsVoidedFalse(roleIdentifier, groupSubjectTypeId);
    }

    private IndividualRelation getRelationWithHeadOfHousehold(String relationshipWithHeadOfHousehold, List<String> errorMsgs) {
        if (relationshipWithHeadOfHousehold == null || relationshipWithHeadOfHousehold.isEmpty()) {
            errorMsgs.add(String.format("'%s' is mandatory for household members", HouseholdMemberHeaders.relationshipWithHeadOfHousehold));
            return null;
        }
        IndividualRelation individualRelation = individualRelationRepository.findByNameIgnoreCase(relationshipWithHeadOfHousehold);
        if (individualRelation == null || individualRelation.isVoided()) {
            errorMsgs.add(String.format("Invalid relation to head of household '%s'", relationshipWithHeadOfHousehold));
            return null;
        }
        return individualRelation;
    }

    private void saveRelationshipWithHeadOfHousehold(IndividualRelationship individualRelationship) {
        if (individualRelationship != null) {
            List<IndividualRelationship> existingRelationships = individualRelationshipRepository.findByIndividualaAndIndividualBAndIsVoidedFalse(individualRelationship.getIndividuala(), individualRelationship.getIndividualB());
            existingRelationships.forEach(existingRelationship -> existingRelationship.setVoided(true));

            individualRelationship.assignUUIDIfRequired();
            individualRelationshipRepository.save(individualRelationship);
        }
    }

    private void saveMembershipDates(Row row, GroupSubject groupSubject, List<String> errorMsgs) {
        LocalDate membershipStartDate = dateCreator.getDate(row, GroupMemberHeaders.membershipStartDate, errorMsgs, null);
        groupSubject.setMembershipStartDate(membershipStartDate != null ? membershipStartDate.toDateTimeAtStartOfDay() : LocalDate.now().toDateTimeAtCurrentTime());

        LocalDate membershipEndDate = dateCreator.getDate(row, GroupMemberHeaders.membershipEndDate, errorMsgs, null);
        if (membershipEndDate != null) {
            groupSubject.setMembershipEndDate(membershipEndDate.toDateTimeAtStartOfDay());
        }
    }

}
