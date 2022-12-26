import http from "../../common/utils/httpClient";

const contactGroupEndpoint = "/web/glificContactGroup";

class GlificService {
  static getContactGroups(pageNumber, pageSize) {
    return http.getData(`${contactGroupEndpoint}?page=${pageNumber}&size=${pageSize}`);
  }

  static getContactGroupContacts(contactGroupId, pageNumber, pageSize) {
    return http.getData(
      `${contactGroupEndpoint}/${contactGroupId}?page=${pageNumber}&size=${pageSize}`
    );
  }
}

export default GlificService;
