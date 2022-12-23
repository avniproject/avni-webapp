import http from "../../common/utils/httpClient";

const endpoint = "/web/glificContactGroup";

class GlificService {
  static getContactGroups(pageNumber, pageSize) {
    return http.getData(`${endpoint}?page=${pageNumber}&size=${pageSize}`);
  }
}

export default GlificService;
