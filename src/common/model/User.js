import _ from "lodash";

class User {
  privileges;
  hasAllPrivileges;
  isAdmin;

  static isAllowedToAccess(user, resourcePrivileges) {
    return (
      user.hasAllPrivileges ||
      _.isEmpty(resourcePrivileges) ||
      !_.isEmpty(_.intersection(resourcePrivileges, user.privileges))
    );
  }
}

export default User;
