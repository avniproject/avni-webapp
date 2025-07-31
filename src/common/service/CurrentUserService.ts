import isEmpty from "lodash/isEmpty";
import intersection from "lodash/intersection";
import UserInfo from "../model/UserInfo";

class CurrentUserService {
  static isAllowedToAccess(userInfo: UserInfo, resourcePrivileges) {
    let uInfo = userInfo || { privileges: [] };
    return (
      uInfo.hasAllPrivileges ||
      isEmpty(resourcePrivileges) ||
      !isEmpty(
        intersection(
          resourcePrivileges,
          uInfo.privileges.map(x => x.privilegeType)
        )
      )
    );
  }

  static isAdminUsingAnOrg(userInfo: UserInfo) {
    return userInfo.isAdmin && CurrentUserService.isOrganisationImpersonated();
  }

  static isOrganisationImpersonated() {
    return !isEmpty(CurrentUserService.getImpersonatedOrgUUID());
  }

  static getImpersonatedOrgUUID() {
    return localStorage.getItem("ORGANISATION_UUID");
  }

  static exitOrganisation() {
    localStorage.setItem("ORGANISATION_UUID", "");
  }

  static isAdminButNotImpersonating(userInfo) {
    return userInfo.isAdmin && !this.isOrganisationImpersonated();
  }

  static hasOrganisationContext(userInfo) {
    return this.isOrganisationImpersonated() || !userInfo.isAdmin;
  }
}

export default CurrentUserService;
