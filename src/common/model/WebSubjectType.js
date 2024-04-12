import { map } from "lodash";
import { default as UUID } from "uuid";
import Types, { SubjectTypeType } from "../../adminApp/SubjectType/Types";

function getHouseholdRoles() {
  const roles = [];
  roles.push(getRole("Head of household", 1, 1));
  roles.push(getRole("Member", 1, 100));
  return roles;
}

function getRole(role, minimumNumberOfMembers, maximumNumberOfMembers) {
  return {
    groupRoleUUID: UUID.v4(),
    role,
    minimumNumberOfMembers,
    maximumNumberOfMembers
  };
}

class WebSubjectType {
  static updateType(subjectType, type) {
    if (type === SubjectTypeType.User) {
      subjectType.allowEmptyLocation = true;
      subjectType.shouldSyncByLocation = false;
      subjectType.directlyAssignable = false;
    }
    if (!Types.isGroup(type)) {
      return { ...subjectType, type, groupRoles: [] };
    }
    const groupRoles = Types.isHousehold(type) ? getHouseholdRoles() : [];
    const memberSubjectType = Types.isHousehold(type) ? map(groupRoles, ({ subjectMemberName }) => subjectMemberName)[0] : "";
    return { groupRoles, memberSubjectType };
  }
}

export default WebSubjectType;
