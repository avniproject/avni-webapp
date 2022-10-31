package org.avni.server.web.request;

import org.avni.server.domain.GroupPrivilege;

public class GroupPrivilegeContractWeb extends CHSRequest {

    private String groupUUID;
    private String privilegeUUID;
    private String subjectTypeUUID;
    private String programUUID;
    private String programEncounterTypeUUID;
    private String encounterTypeUUID;
    private String checklistDetailUUID;
    private boolean allow;

    public static GroupPrivilegeContractWeb fromEntity(GroupPrivilege groupPrivilege) {
        GroupPrivilegeContractWeb groupPrivilegeContractWeb = new GroupPrivilegeContractWeb();
        groupPrivilegeContractWeb.setUuid(groupPrivilege.getUuid());
        groupPrivilegeContractWeb.setGroupUUID(groupPrivilege.getGroupUuid());
        groupPrivilegeContractWeb.setPrivilegeUUID(groupPrivilege.getPrivilegeUuid());
        groupPrivilegeContractWeb.setSubjectTypeUUID(groupPrivilege.getSubjectTypeUuid());
        groupPrivilegeContractWeb.setProgramUUID(groupPrivilege.getProgramUuid());
        groupPrivilegeContractWeb.setProgramEncounterTypeUUID(groupPrivilege.getProgramEncounterTypeUuid());
        groupPrivilegeContractWeb.setEncounterTypeUUID(groupPrivilege.getEncounterTypeUuid());
        groupPrivilegeContractWeb.setChecklistDetailUUID(groupPrivilege.getChecklistDetailUuid());
        groupPrivilegeContractWeb.setAllow(groupPrivilege.isAllow());
        return groupPrivilegeContractWeb;
    }

    public String getGroupUUID() {
        return groupUUID;
    }

    public void setGroupUUID(String groupUUID) {
        this.groupUUID = groupUUID;
    }

    public String getPrivilegeUUID() {
        return privilegeUUID;
    }

    public void setPrivilegeUUID(String privilegeUUID) {
        this.privilegeUUID = privilegeUUID;
    }

    public String getSubjectTypeUUID() {
        return subjectTypeUUID;
    }

    public void setSubjectTypeUUID(String subjectTypeUUID) {
        this.subjectTypeUUID = subjectTypeUUID;
    }

    public String getProgramUUID() {
        return programUUID;
    }

    public void setProgramUUID(String programUUID) {
        this.programUUID = programUUID;
    }

    public String getProgramEncounterTypeUUID() {
        return programEncounterTypeUUID;
    }

    public void setProgramEncounterTypeUUID(String programEncounterTypeUUID) {
        this.programEncounterTypeUUID = programEncounterTypeUUID;
    }

    public String getEncounterTypeUUID() {
        return encounterTypeUUID;
    }

    public void setEncounterTypeUUID(String encounterTypeUUID) {
        this.encounterTypeUUID = encounterTypeUUID;
    }

    public String getChecklistDetailUUID() {
        return checklistDetailUUID;
    }

    public void setChecklistDetailUUID(String checklistDetailUUID) {
        this.checklistDetailUUID = checklistDetailUUID;
    }

    public boolean isAllow() {
        return allow;
    }

    public void setAllow(boolean allow) {
        this.allow = allow;
    }
}
