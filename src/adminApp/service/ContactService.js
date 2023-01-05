import http from "../../common/utils/httpClient";

const contactGroupEndpoint = "/web/contactGroup";

class ContactService {
  static getContactGroups(pageNumber, pageSize) {
    return http.getData(`${contactGroupEndpoint}?page=${pageNumber}&size=${pageSize}`);
  }

  static getContactGroupContacts(contactGroupId, pageNumber, pageSize) {
    return http.getData(
      `${contactGroupEndpoint}/${contactGroupId}?page=${pageNumber}&size=${pageSize}`
    );
  }

  static addSubjectToContactGroup(contactGroupId, subject) {
    return http.postJson(`${contactGroupEndpoint}/${contactGroupId}/subject`, { id: subject.id });
  }
}

export default ContactService;
