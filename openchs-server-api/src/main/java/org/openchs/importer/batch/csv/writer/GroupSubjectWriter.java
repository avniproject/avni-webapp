package org.openchs.importer.batch.csv.writer;

import org.openchs.dao.GroupRoleRepository;
import org.openchs.dao.GroupSubjectRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.individualRelationship.IndividualRelationRepository;
import org.openchs.domain.GroupRole;
import org.openchs.domain.GroupSubject;
import org.openchs.domain.Individual;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.importer.batch.csv.writer.header.GroupMemberHeaders;
import org.openchs.importer.batch.csv.writer.header.HouseholdMemberHeaders;
import org.openchs.importer.batch.model.Row;
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
    private IndividualRelationRepository individualRelationRepository;

    private final GroupMemberHeaders groupMemberHeaders = new GroupMemberHeaders();
    private final HouseholdMemberHeaders householdMemberHeaders = new HouseholdMemberHeaders();

    @Autowired
    public GroupSubjectWriter(GroupSubjectRepository groupSubjectRepository, GroupRoleRepository groupRoleRepository, IndividualRepository individualRepository, IndividualRelationRepository individualRelationRepository) {
        this.groupSubjectRepository = groupSubjectRepository;
        this.groupRoleRepository = groupRoleRepository;
        this.individualRepository = individualRepository;
        this.individualRelationRepository = individualRelationRepository;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        List<String> allErrorMsgs = new ArrayList<>();

        GroupSubject groupSubject = getOrCreateGroupSubject(row, allErrorMsgs);
        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }
        boolean isHousehold = groupSubject.getGroupSubject().getSubjectType().isHousehold();
        IndividualRelation individualRelation = null;

        if (isHousehold) {
            groupSubject.setGroupRole(getHouseholdGroupRole(row.getBool(householdMemberHeaders.isHeadOfHousehold), allErrorMsgs, householdMemberHeaders.isHeadOfHousehold));
            individualRelation = getRelationWithHeadOfHousehold(groupSubject, row.get(householdMemberHeaders.relationshipWithHeadOfHousehold), allErrorMsgs);
        } else {
            groupSubject.setGroupRole(getGroupRole(row.get(groupMemberHeaders.role), allErrorMsgs, groupMemberHeaders.role));
        }

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        groupSubjectRepository.save(groupSubject);
        if (individualRelation != null) {
            saveRelationshipWithHeadOfHousehold(groupSubject, individualRelation);
        }
    }

    private GroupSubject getOrCreateGroupSubject(Row row, List<String> errorMsgs) {
        String groupId = row.get(groupMemberHeaders.groupId);
        String memberId = row.get(groupMemberHeaders.memberId);

        Individual existingGroup = null;
        Individual existingMember = null;
        GroupSubject existingGroupSubject = null;

        if (!(groupId == null || groupId.isEmpty()) && !(memberId == null || memberId.isEmpty())) {
            existingGroup = individualRepository.findByLegacyId(groupId);
            if (existingGroup == null) {
                errorMsgs.add(String.format("Invalid '%s'", groupMemberHeaders.groupId));
                return null;
            }
            existingMember = individualRepository.findByLegacyId(memberId);
            if (existingMember == null) {
                errorMsgs.add(String.format("Invalid '%s'", groupMemberHeaders.memberId));
                return null;
            }
            existingGroupSubject = groupSubjectRepository.findByGroupSubjectAndMemberSubject(existingGroup, existingMember);
        }
        return existingGroupSubject == null ? createNewGroupSubject(existingGroup, existingMember, errorMsgs) : existingGroupSubject;
    }

    private GroupSubject createNewGroupSubject(Individual group, Individual member, List<String> errorMsgs) {
        if (!group.getSubjectType().isGroup()) {
            errorMsgs.add(String.format("Group Id '%s' is not of type group", groupMemberHeaders.groupId));
            return null;
        }
        GroupSubject groupSubject = new GroupSubject();

        groupSubject.setGroupSubject(group);
        groupSubject.setMemberSubject(member);
        return groupSubject;
    }

    public GroupRole getGroupRole(String role, List<String> errorMsgs, String roleIdentifier) {
        if (role == null) {
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
        GroupRole groupRole = groupRoleRepository.findByRole(roleIdentifier);
        if (groupRole == null) { // || groupRole.isVoided()) {
            errorMsgs.add(String.format("'%s' household role not found", roleIdentifier));
            return null;
        }
        return groupRole;

    }

    private IndividualRelation getRelationWithHeadOfHousehold(GroupSubject groupSubject, String relationshipWithHeadOfHousehold, List<String> errorMsgs) {
        if (relationshipWithHeadOfHousehold == null) {
            errorMsgs.add(String.format("'%s' is mandatory", householdMemberHeaders.relationshipWithHeadOfHousehold)); //TODO check if this is mandatory for head of household
            return null;
        }
        IndividualRelation individualRelation = individualRelationRepository.findByNameIgnoreCase(relationshipWithHeadOfHousehold);
        if (individualRelation == null || individualRelation.isVoided()) {
            errorMsgs.add(String.format("Invalid relation to head of household '%s'", relationshipWithHeadOfHousehold));
            return null;
        }
        return individualRelation;
    }

    private void saveRelationshipWithHeadOfHousehold(GroupSubject groupSubject, IndividualRelation individualRelation) {
        //TODO find the head of household for the group and add the relationship
    }
}
