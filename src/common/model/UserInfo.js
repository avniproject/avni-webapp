import _ from "lodash";
import { Privilege } from "openchs-models";
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
      _.some(userInfo.privileges, (x: Privilege) => x.privilegeType === privilegeType)
    );
  }

  static hasAnyPrivilege(userInfo, privilegeTypes) {
    return (
      userInfo.hasAllPrivileges ||
      _.intersection(userInfo.privileges.map(x => x.privilegeType), privilegeTypes).length > 0
    );
  }

  static hasFormEditPrivilege(userInfo, formType) {
    return UserInfo.hasPrivilege(userInfo, getPrivilegeType(formType));
  }
}

export default UserInfo;
