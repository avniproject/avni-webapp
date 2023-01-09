import http from "../../common/utils/httpClient";
import _ from "lodash";

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

  static addUserToContactGroup(contactGroupId, user) {
    return http.postJson(`${contactGroupEndpoint}/${contactGroupId}/user`, { id: user.id });
  }

  static addEditContactGroup(contactGroup, name, description) {
    if (_.isNil(contactGroup))
      return http.postJson(`${contactGroupEndpoint}`, { name: name, description: description });
    else
      return http.putJson(`${contactGroupEndpoint}/${contactGroup.id}`, {
        name: name,
        description: description
      });
  }
}

export default ContactService;
