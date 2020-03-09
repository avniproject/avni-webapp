import { httpClient } from "common/utils/httpClient";
export default {
  fetchOrganisationConfig: () =>
    httpClient.fetchJson("/web/organizations").then(response => response.json)
};
