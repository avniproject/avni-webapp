import CurrentUserService from "./service/CurrentUserService";

class AvniRouter {
  static getRedirectRouteFromRoot(userInfo) {
    return CurrentUserService.isAdminButNotImpersonating(userInfo)
      ? "/admin"
      : "/home";
  }
}

export default AvniRouter;
