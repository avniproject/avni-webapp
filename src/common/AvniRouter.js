class AvniRouter {
  static getRouteFromRoot(userInfo) {
    return userInfo.isAdmin ? "/admin" : "/home";
  }
}

export default AvniRouter;
