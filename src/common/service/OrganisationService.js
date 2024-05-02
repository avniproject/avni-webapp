import http from "../utils/httpClient";
import CurrentUserService from "./CurrentUserService";

class OrganisationService {
  static getOrganisation(id) {
    return http.fetchJson(`/organisation/${id}`).then(response => response.json);
  }

  static getApplicableOrganisation(id) {
    return CurrentUserService.isOrganisationImpersonated()
      ? OrganisationService.getOrganisation(id)
      : http.fetchJson("/organisation/current").then(response => response.json);
  }
}

export default OrganisationService;
