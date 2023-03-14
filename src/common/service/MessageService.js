import httpClient from "../utils/httpClient";

class MessageService {
  static getSubjectMessages(subjectID) {
    return httpClient.get(`/web/contact/subject/${subjectID}/msgs`);
  }

  static getUserMessages(userID) {
    return httpClient.get(`/web/contact/user/${userID}/msgs`);
  }

  static getSentGroupMessageRequests(contactGroupId) {
    return httpClient.getData(`/web/message/contactGroup/${contactGroupId}/msgsSent`);
  }

  static getUnSentGroupMessageRequests(contactGroupId) {
    return httpClient.getData(`/web/message/contactGroup/${contactGroupId}/msgsNotYetSent`);
  }
}

export default MessageService;
