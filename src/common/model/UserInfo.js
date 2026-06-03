import _ from "lodash";
import { getPrivilegeType } from "../../adminApp/domain/formMapping";

class UserInfo {
  privileges;
  hasAllPrivileges;
  isAdmin;

  static createEmpty() {
    return {
      privileges: [],
    };
  }

  static hasPrivilege(userInfo, privilegeType) {
    return userInfo.hasAllPrivileges || _.some(userInfo.privileges, (x) => x.privilegeType === privilegeType);
  }

  // Mirrors the avni-client privilegeService check that scopes a privilege
  // (e.g. EditSubject) to a specific subjectType UUID. Falls back to the
  // unrestricted check when the user has all privileges. Returns false on
  // empty/missing userInfo or subjectTypeUuid so callers can use it as a
  // straight conditional in render guards.
  static hasPrivilegeForSubjectType(userInfo, privilegeType, subjectTypeUuid) {
    if (!userInfo || !subjectTypeUuid) return false;
    if (userInfo.hasAllPrivileges) return true;
    return _.some(userInfo.privileges, (x) => x.privilegeType === privilegeType && x.subjectType && x.subjectType.uuid === subjectTypeUuid);
  }

  static hasMultiplePrivileges(userInfo, privilegeTypes = []) {
    return (
      userInfo.hasAllPrivileges ||
      _.intersectionBy(
        userInfo.privileges,
        privilegeTypes.map((x) => {
          return { privilegeType: x };
        }),
        "privilegeType",
      ).length === privilegeTypes.length
    );
  }

  static hasFormEditPrivilege(userInfo, formType) {
    return UserInfo.hasPrivilege(userInfo, getPrivilegeType(formType));
  }
}

export default UserInfo;
