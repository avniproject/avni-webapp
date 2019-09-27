import { httpClient } from "../../common/utils/httpClient";

export default {
  fetchOrgConfig: () => httpClient.fetchJson("/organisationConfig").then(response => response.json),
  fetchDashboardData: (params) => httpClient.fetchJson(httpClient.withParams("/translation", params))
    .then(res => res.json)
};
