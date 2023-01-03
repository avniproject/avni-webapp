import httpClient from "../utils/httpClient";

export default {
  fetchOperationalModules: () =>
    httpClient.fetchJson("/web/operationalModules").then(response => response.json),
  fetchGenders: () => httpClient.fetchJson("/web/gender").then(response => response.json),
  fetchOrganisationConfigs: () =>
    httpClient.fetchJson("/web/organisationConfig").then(response => response.json)
};
