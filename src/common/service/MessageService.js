import httpClient from "../utils/httpClient";

class MessageService {
  static getSubjectMessages(subjectID) {
    return httpClient.get(`/web/contact/subject/${subjectID}/msgs`);
  }
  static getUserMessages(userID) {
    return httpClient.get(`/web/contact/user/${userID}/msgs`);
  }
}

export default MessageService;
