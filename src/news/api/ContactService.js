import { httpClient as http } from "../../common/utils/httpClient";
import _ from "lodash";

const contactGroupEndpoint = "/web/contactGroup";

class ContactService {
  static removeContactsFromGroup(contactGroupId, contactIds) {
    return http.delete(`${contactGroupEndpoint}/${contactGroupId}/contact`, { data: contactIds });
  }

  static getContactGroups(labelFilter, pageNumber, pageSize) {
    return http.getData(`${contactGroupEndpoint}?page=${pageNumber}&size=${pageSize}&label=${labelFilter}`);
  }

  static getContactGroupContacts(contactGroupId, pageNumber, pageSize) {
    return http.getData(`${contactGroupEndpoint}/${contactGroupId}?page=${pageNumber}&size=${pageSize}`);
  }

  static addSubjectToContactGroup(contactGroupId, subject) {
    return http.postJson(`${contactGroupEndpoint}/${contactGroupId}/subject`, { id: subject.id });
  }

  static addUserToContactGroup(contactGroupId, user) {
    return http.postJson(`${contactGroupEndpoint}/${contactGroupId}/user`, { id: user.id });
  }

  static addEditContactGroup(contactGroup, label, description) {
    if (_.isNil(contactGroup)) return http.postJson(`${contactGroupEndpoint}`, { label: label, description: description });
    else
      return http.putJson(`${contactGroupEndpoint}/${contactGroup.id}`, {
        label: label,
        description: description
      });
  }

  static deleteContactGroup(contactGroupIds) {
    return http.delete(`${contactGroupEndpoint}`, { data: contactGroupIds });
  }
}

export default ContactService;
