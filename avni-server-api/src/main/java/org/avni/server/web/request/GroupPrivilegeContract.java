package org.avni.server.web.request;

import org.avni.server.domain.ChecklistDetail;
import org.avni.server.domain.EncounterType;
import org.avni.server.domain.GroupPrivilege;
import org.avni.server.domain.Program;

import java.util.Objects;
import java.util.Optional;

public class GroupPrivilegeContract {

    private Long groupPrivilegeId;
    private Long groupId;
    private Long privilegeId;
    private String privilegeEntityType;
    private String privilegeName;
    private String privilegeDescription;
    private Long subjectTypeId;
    private String subjectTypeName;
    private Optional<Long> programId;
    private Optional<String> programName;
    private Optional<Long> programEncounterTypeId;
    private Optional<String> programEncounterTypeName;
    private Optional<Long> encounterTypeId;
    private Optional<String> encounterTypeName;
    private Optional<Long> checklistDetailId;
    private Optional<String> checklistDetailName;
    private boolean allow;
    private String uuid;

    public static GroupPrivilegeContract fromEntity(GroupPrivilege groupPrivilege) {
        GroupPrivilegeContract groupPrivilegeContract = new GroupPrivilegeContract();
        groupPrivilegeContract.setGroupPrivilegeId(groupPrivilege.getId());
        groupPrivilegeContract.setGroupId(groupPrivilege.getGroup().getId());
        groupPrivilegeContract.setPrivilegeId(groupPrivilege.getPrivilege().getId());
        groupPrivilegeContract.setPrivilegeEntityType(groupPrivilege.getPrivilege().getEntityType().toString());
        groupPrivilegeContract.setPrivilegeName(groupPrivilege.getPrivilege().getName());
        groupPrivilegeContract.setPrivilegeDescription(groupPrivilege.getPrivilege().getDescription());
        groupPrivilegeContract.setSubjectTypeId(groupPrivilege.getSubjectType().getId());
        groupPrivilegeContract.setSubjectTypeName(groupPrivilege.getSubjectType().getName());
        groupPrivilegeContract.setProgramId(Optional.ofNullable(groupPrivilege.getProgram()).map(Program::getId));
        groupPrivilegeContract.setProgramName(Optional.ofNullable(groupPrivilege.getProgram()).map(Program::getName).orElse(null));
        groupPrivilegeContract.setProgramEncounterTypeId(Optional.ofNullable(groupPrivilege.getProgramEncounterType()).map(EncounterType::getId));
        groupPrivilegeContract.setProgramEncounterTypeName(Optional.ofNullable(groupPrivilege.getProgramEncounterType()).map(EncounterType::getName).orElse(null));
        groupPrivilegeContract.setEncounterTypeId(Optional.ofNullable(groupPrivilege.getEncounterType()).map(EncounterType::getId));
        groupPrivilegeContract.setEncounterTypeName(Optional.ofNullable(groupPrivilege.getEncounterType()).map(EncounterType::getName).orElse(null));
        groupPrivilegeContract.setChecklistDetailId(Optional.ofNullable(groupPrivilege.getChecklistDetail()).map(ChecklistDetail::getId));
        groupPrivilegeContract.setChecklistDetailName(Optional.ofNullable(groupPrivilege.getChecklistDetail()).map(ChecklistDetail::getName).orElse(null));
        groupPrivilegeContract.setAllow(groupPrivilege.isAllow());
        groupPrivilegeContract.setUuid(groupPrivilege.getUuid());
        return groupPrivilegeContract;

    }

    public Long getSubjectTypeId() {
        return subjectTypeId;
    }

    public void setSubjectTypeId(Long subjectTypeId) {
        this.subjectTypeId = subjectTypeId;
    }

    public Optional<Long> getProgramId() {
        return programId;
    }

    public void setProgramId(Optional<Long> programId) {
        this.programId = programId;
    }

    public Optional<Long> getProgramEncounterTypeId() {
        return programEncounterTypeId;
    }

    public void setProgramEncounterTypeId(Optional<Long> programEncounterTypeId) {
        this.programEncounterTypeId = programEncounterTypeId;
    }

    public Optional<Long> getEncounterTypeId() {
        return encounterTypeId;
    }

    public void setEncounterTypeId(Optional<Long> encounterTypeId) {
        this.encounterTypeId = encounterTypeId;
    }

    public Optional<Long> getChecklistDetailId() {
        return checklistDetailId;
    }

    public void setChecklistDetailId(Optional<Long> checklistDetailId) {
        this.checklistDetailId = checklistDetailId;
    }

    public Long getGroupPrivilegeId() {
        return groupPrivilegeId;
    }

    public void setGroupPrivilegeId(Long groupPrivilegeId) {
        this.groupPrivilegeId = groupPrivilegeId;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public Long getPrivilegeId() {
        return privilegeId;
    }

    public void setPrivilegeId(Long privilegeId) {
        this.privilegeId = privilegeId;
    }

    public String getPrivilegeEntityType() {
        return privilegeEntityType;
    }

    public void setPrivilegeEntityType(String privilegeEntityType) {
        this.privilegeEntityType = privilegeEntityType;
    }

    public String getPrivilegeName() {
        return privilegeName;
    }

    public void setPrivilegeName(String privilegeName) {
        this.privilegeName = privilegeName;
    }

    public String getPrivilegeDescription() {
        return privilegeDescription;
    }

    public void setPrivilegeDescription(String privilegeDescription) {
        this.privilegeDescription = privilegeDescription;
    }

    public String getSubjectTypeName() {
        return subjectTypeName;
    }

    public void setSubjectTypeName(String subjectTypeName) {
        this.subjectTypeName = subjectTypeName;
    }

    public Optional<String> getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = Optional.ofNullable(programName);
    }

    public Optional<String> getProgramEncounterTypeName() {
        return programEncounterTypeName;
    }

    public void setProgramEncounterTypeName(String programEncounterTypeName) {
        this.programEncounterTypeName = Optional.ofNullable(programEncounterTypeName);
    }

    public Optional<String> getEncounterTypeName() {
        return encounterTypeName;
    }

    public void setEncounterTypeName(String encounterTypeName) {
        this.encounterTypeName = Optional.ofNullable(encounterTypeName);
    }

    public Optional<String> getChecklistDetailName() {
        return checklistDetailName;
    }

    public void setChecklistDetailName(String checklistDetailName) {
        this.checklistDetailName = Optional.ofNullable(checklistDetailName);
    }

    public boolean isAllow() {
        return allow;
    }

    public void setAllow(boolean allow) {
        this.allow = allow;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GroupPrivilegeContract that = (GroupPrivilegeContract) o;
        return groupId.equals(that.groupId) &&
                privilegeId.equals(that.privilegeId) &&
                subjectTypeId.equals(that.subjectTypeId) &&
                Objects.equals(programId, that.programId) &&
                Objects.equals(programEncounterTypeId, that.programEncounterTypeId) &&
                Objects.equals(encounterTypeId, that.encounterTypeId) &&
                Objects.equals(checklistDetailId, that.checklistDetailId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupId, privilegeId, subjectTypeId, programId, programEncounterTypeId, encounterTypeId, checklistDetailId);
    }
}
