import _ from "lodash";
import { Privilege } from "openchs-models";

class UserInfo {
  privileges;
  hasAllPrivileges;
  isAdmin;

  static hasPrivilege(userInfo, privilegeType) {
    return (
      userInfo.hasAllPrivileges ||
      _.some(userInfo.privileges, (x: Privilege) => x.privilegeType === privilegeType)
    );
  }
}

export default UserInfo;
