import { Privilege } from "openchs-models";
import _ from "lodash";

function matchingId(a, b, fieldName) {
  const fieldPath = fieldName + ".id";
  return _.get(a, fieldPath) === _.get(b, fieldPath);
}

function matchingSubjectType(a, b) {
  return matchingId(a, b, "subjectType");
}

function matchingProgram(a, b) {
  return matchingId(a, b, "program");
}

function matchingEncounterType(a, b) {
  return matchingId(a, b, "encounterType");
}

function matchingProgramEncounterType(a, b) {
  return matchingId(a, b, "programEncounterType");
}

// named model to keep it diff from component with same name
class GroupPrivilegesModel {
  static getSubjectTypeDependencies(groupPrivileges, groupPrivilege) {
    return groupPrivileges.filter(
      x =>
        x["privilegeType"] === Privilege.PrivilegeType.VIEW_SUBJECT &&
        matchingSubjectType(x, groupPrivilege)
    );
  }

  static getProgramDependencies(groupPrivilegeList, groupPrivilege) {
    return groupPrivilegeList.filter(
      x =>
        (x["privilegeType"] === Privilege.PrivilegeType.VIEW_ENROLMENT_DETAILS &&
          matchingSubjectType(x, groupPrivilege) &&
          matchingProgram(x, groupPrivilege)) ||
        (x["privilegeType"] === Privilege.PrivilegeType.VIEW_SUBJECT &&
          matchingSubjectType(x, groupPrivilege))
    );
  }

  static getEncounterTypeDependencies(groupPrivilegeList, groupPrivilege) {
    return groupPrivilegeList.filter(
      x =>
        (x["privilegeType"] === Privilege.PrivilegeType.VIEW_VISIT &&
          matchingSubjectType(x, groupPrivilege) &&
          matchingEncounterType(x, groupPrivilege) &&
          matchingProgramEncounterType(x, groupPrivilege) &&
          matchingProgram(x, groupPrivilege)) ||
        (x["privilegeType"] === Privilege.PrivilegeType.VIEW_SUBJECT &&
          matchingSubjectType(x, groupPrivilege))
    );
  }

  static getChecklistDependencies(groupPrivilegeList, groupPrivilege) {
    return groupPrivilegeList.filter(
      x =>
        (x["privilegeType"] === Privilege.PrivilegeType.VIEW_CHECKLIST &&
          matchingSubjectType(x, groupPrivilege) &&
          matchingId(x, groupPrivilege, "checklistDetail")) ||
        (x["privilegeType"] === Privilege.PrivilegeType.VIEW_SUBJECT &&
          matchingSubjectType(x, groupPrivilege))
    );
  }
}

export default GroupPrivilegesModel;
