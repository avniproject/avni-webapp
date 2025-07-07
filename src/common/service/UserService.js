import { httpClient as http } from "../utils/httpClient";

const userEndpoint = "/user",
  userSearchEndpoint = "/user/search/find";

class UserService {
  static searchUsers(name, phoneNumber, email) {
    return http
      .fetchJson(`${userSearchEndpoint}?name=${name}&phoneNumber=${phoneNumber}&email=${email}&page=${0}&size=${30}`)
      .then(response => response.json);
  }
  static searchUserById(id) {
    return http.get(`${userEndpoint}/${id}`);
  }
}

export default UserService;
