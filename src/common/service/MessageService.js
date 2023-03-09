import httpClient from "../utils/httpClient";

class MessageService {
  static getMessages(subjectID) {
    return httpClient.get(`/web/contact/subject/${subjectID}/msgs`);
  }
}

export default MessageService;
