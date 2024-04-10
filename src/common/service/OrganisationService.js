import http from "../utils/httpClient";

class OrganisationService {
  static getOrganisation(id) {
    return http.get(`/organisation/${id}`).then(res => res.data);
  }
}

export default OrganisationService;
