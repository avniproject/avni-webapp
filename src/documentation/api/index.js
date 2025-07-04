import { httpClient as http } from "common/utils/httpClient";
import { get } from "lodash";

export default {
  getDocumentation: () => http.fetchJson("/web/documentation").then(response => response.json),
  getOrganisationConfig: () => http.fetchJson("/web/organisationConfig").then(response => response.json),
  saveDocumentation: documentation =>
    http
      .postJson("/web/documentation", documentation)
      .then(r => [r.data, null])
      .catch(r => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`]),
  deleteDocumentation: uuid =>
    http
      .delete(`/web/documentation/${uuid}`)
      .then(r => null)
      .catch(r => `${get(r, "response.data") || get(r, "message") || "unknown error"}`)
};
