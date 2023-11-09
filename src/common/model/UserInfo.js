import _ from "lodash";
import { getPrivilegeType } from "../../adminApp/domain/formMapping";

class UserInfo {
  privileges;
  hasAllPrivileges;
  isAdmin;

  static createEmpty() {
    return {
      privileges: []
    };
  }

  static hasPrivilege(userInfo, privilegeType) {
    return (
      userInfo.hasAllPrivileges ||
      _.some(userInfo.privileges, x => x.privilegeType === privilegeType)
    );
  }

  static hasMultiplePrivileges(userInfo, privilegeTypes = []) {
    return (
      userInfo.hasAllPrivileges ||
      _.intersectionBy(
        userInfo.privileges,
        privilegeTypes.map(x => {
          return { privilegeType: x };
        }),
        "privilegeType"
      ).length === privilegeTypes.length
    );
  }

  static hasFormEditPrivilege(userInfo, formType) {
    return UserInfo.hasPrivilege(userInfo, getPrivilegeType(formType));
  }
}

export default UserInfo;
