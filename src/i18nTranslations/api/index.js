import { httpClient } from "common/utils/httpClient";
export default {
  fetchOrganisationConfig: () =>
    httpClient.fetchJson("/organisationConfig").then(response => response.json)
};
