import _, { isEmpty } from "lodash";
import UserInfo from "../model/UserInfo";

class CurrentUserService {
  static isAllowedToAccess(userInfo: UserInfo, resourcePrivileges) {
    let uInfo = userInfo || {};
    return (
      uInfo.hasAllPrivileges ||
      _.isEmpty(resourcePrivileges) ||
      !_.isEmpty(_.intersection(resourcePrivileges, uInfo.privileges))
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
