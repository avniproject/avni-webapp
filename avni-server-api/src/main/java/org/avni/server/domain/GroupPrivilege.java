package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "group_privilege")
@JsonIgnoreProperties({"group", "privilege", "subjectType", "program", "programEncounterType", "encounterType", "checklistDetail"})
@BatchSize(size = 100)
public class GroupPrivilege extends OrganisationAwareEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "privilege_id")
    private Privilege privilege;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_type_id")
    private SubjectType subjectType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_encounter_type_id")
    private EncounterType programEncounterType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_type_id")
    private EncounterType encounterType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_detail_id")
    private ChecklistDetail checklistDetail;

    private boolean allow;

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public Privilege getPrivilege() {
        return privilege;
    }

    public void setPrivilege(Privilege privilege) {
        this.privilege = privilege;
    }

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public EncounterType getProgramEncounterType() {
        return programEncounterType;
    }

    public void setProgramEncounterType(EncounterType programEncounterType) {
        this.programEncounterType = programEncounterType;
    }

    public EncounterType getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(EncounterType encounterType) {
        this.encounterType = encounterType;
    }

    public ChecklistDetail getChecklistDetail() {
        return checklistDetail;
    }

    public void setChecklistDetail(ChecklistDetail checklistDetail) {
        this.checklistDetail = checklistDetail;
    }

    public boolean isAllow() {
        return allow;
    }

    public void setAllow(boolean allow) {
        this.allow = allow;
    }

    public String getGroupUuid() {
        return group.getUuid();
    }

    public String getPrivilegeUuid() {
        return privilege.getUuid();
    }

    public String getSubjectTypeUuid() {
        return getNullSafeUuid(subjectType);
    }

    public String getProgramUuid() {
        return getNullSafeUuid(program);
    }

    public String getProgramEncounterTypeUuid() {
        return getNullSafeUuid(programEncounterType);
    }

    public String getEncounterTypeUuid() {
        return getNullSafeUuid(encounterType);
    }

    public String getChecklistDetailUuid() {
        return getNullSafeUuid(checklistDetail);
    }

    private <T extends CHSEntity> String getNullSafeUuid(T entity) {
        if (entity == null) {
            return null;
        }
        return entity.getUuid();
    }

    public boolean isSubjectPrivilege() {
        return subjectType != null && program == null && programEncounterType == null && encounterType == null && checklistDetail == null;
    }

    public boolean isEncounterPrivilege() {
        return subjectType != null && encounterType != null;
    }

    public boolean isProgramPrivilege() {
        return subjectType != null && program != null && programEncounterType == null;
    }

    public boolean isProgramEncounterPrivilege() {
        return subjectType != null && program != null && programEncounterType != null;
    }

    public boolean isChecklistPrivilege() {
        return subjectType != null && checklistDetail != null;
    }

    public boolean matches(String privilegeName, SubjectType subjectType, Program program, EncounterType encounterType, ChecklistDetail checklistDetail) {
        return this.getPrivilege().getName().equals(privilegeName)
                && itemsMatch(subjectType, this.getSubjectType()) && itemsMatch(program, this.getProgram())
                && (itemsMatch(encounterType, this.getEncounterType())
                || itemsMatch(encounterType, this.getProgramEncounterType()))
                && itemsMatch(checklistDetail, this.getChecklistDetail());
    }

    private boolean itemsMatch(CHSBaseEntity o1, CHSBaseEntity o2) {
        if (o1 == null && o2 == null) return true;
        if (o1 == null && o2 != null) return false;
        if (o2 == null) return false;
        return o1.getId() == o2.getId();
    }

    public String getTypeUUID() {
        if (isEncounterPrivilege()) {
            return getEncounterTypeUuid();
        } else if (isProgramPrivilege()) {
            return getProgramUuid();
        } else if (isProgramEncounterPrivilege()) {
            return getProgramEncounterTypeUuid();
        } else if (isChecklistPrivilege()) {
            return getChecklistDetailUuid();
        } else {
            return getSubjectTypeUuid();
        }
    }

}
