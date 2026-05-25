import { Privilege } from "openchs-models";
import _ from "lodash";

function matchingId(a, b, fieldName) {
  const fieldPath = fieldName + "Id";
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
      (x) => x["privilegeTypeName"] === Privilege.PrivilegeType.ViewSubject && matchingSubjectType(x, groupPrivilege),
    );
  }

  static getProgramDependencies(groupPrivilegeList, groupPrivilege) {
    return groupPrivilegeList.filter(
      (x) =>
        (x["privilegeTypeName"] === Privilege.PrivilegeType.ViewEnrolmentDetails &&
          matchingSubjectType(x, groupPrivilege) &&
          matchingProgram(x, groupPrivilege)) ||
        (x["privilegeTypeName"] === Privilege.PrivilegeType.ViewSubject && matchingSubjectType(x, groupPrivilege)),
    );
  }

  static getEncounterTypeDependencies(groupPrivilegeList, groupPrivilege) {
    return groupPrivilegeList.filter(
      (x) =>
        (x["privilegeTypeName"] === Privilege.PrivilegeType.ViewVisit &&
          matchingSubjectType(x, groupPrivilege) &&
          matchingEncounterType(x, groupPrivilege) &&
          matchingProgramEncounterType(x, groupPrivilege) &&
          matchingProgram(x, groupPrivilege)) ||
        (x["privilegeTypeName"] === Privilege.PrivilegeType.ViewSubject && matchingSubjectType(x, groupPrivilege)),
    );
  }

  static getChecklistDependencies(groupPrivilegeList, groupPrivilege) {
    return groupPrivilegeList.filter(
      (x) =>
        (x["privilegeTypeName"] === Privilege.PrivilegeType.ViewChecklist &&
          matchingSubjectType(x, groupPrivilege) &&
          matchingId(x, groupPrivilege, "checklistDetail")) ||
        (x["privilegeTypeName"] === Privilege.PrivilegeType.ViewSubject && matchingSubjectType(x, groupPrivilege)),
    );
  }

  static getEditUserGroupDependencies(groupPrivilegeList) {
    return groupPrivilegeList.filter((x) => x["privilegeTypeName"] === Privilege.PrivilegeType.EditUserConfiguration);
  }

  static getAddMemberDependencies(groupPrivilegeList, groupPrivilege) {
    const memberSubjectIds = groupPrivilege.memberSubjectIds || [];
    return groupPrivilegeList.filter(
      (x) =>
        x["privilegeTypeName"] === Privilege.PrivilegeType.ViewSubject &&
        (matchingSubjectType(x, groupPrivilege) || memberSubjectIds.includes(x.subjectTypeId)),
    );
  }

  static getViewVisitDependencies(groupPrivilegeList, groupPrivilege) {
    const isProgramEncounter = !_.isNil(groupPrivilege.programId);
    return groupPrivilegeList.filter(
      (x) =>
        (x["privilegeTypeName"] === Privilege.PrivilegeType.ViewSubject && matchingSubjectType(x, groupPrivilege)) ||
        (isProgramEncounter &&
          x["privilegeTypeName"] === Privilege.PrivilegeType.ViewEnrolmentDetails &&
          matchingSubjectType(x, groupPrivilege) &&
          matchingProgram(x, groupPrivilege)),
    );
  }

  // BFS over the dependency graph, following either "dependencies" (when toggling ON)
  // or "dependents" (when toggling OFF), so the cascade is transitive rather than one-level.
  static collectTransitive(dependencyMap, startUuid, edgeKey) {
    const visited = new Set([startUuid]);
    const stack = [startUuid];
    while (stack.length > 0) {
      const current = stack.pop();
      const entry = dependencyMap.get(current);
      const edges = (entry && entry[edgeKey]) || [];
      edges.forEach((next) => {
        if (!visited.has(next)) {
          visited.add(next);
          stack.push(next);
        }
      });
    }
    visited.delete(startUuid);
    return [...visited];
  }
}

export default GroupPrivilegesModel;
