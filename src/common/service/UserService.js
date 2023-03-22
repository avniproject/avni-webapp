import http from "../utils/httpClient";

const userEndpoint = "/user/",
  userSearchEndpoint = "/user/search/findUsersByNameOrEmailOrPhoneNumber";

class UserService {
  static searchUsers(name, phoneNumber, email) {
    return http.getPageData(
      "user",
      `${userSearchEndpoint}?name=${name}&phoneNumber=${phoneNumber}&email=${email}&page=${0}&size=${30}`
    );
  }
  static searchUserById(id) {
    return http.get(`${userEndpoint}/${id}`);
  }
}

export default UserService;
