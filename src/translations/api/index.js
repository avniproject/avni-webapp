import http from "../../common/utils/httpClient";

export default {
  fetchOrgConfig: () => http.fetchJson("/organisationConfig").then(response => response.json),
  fetchDashboardData: params =>
    http.fetchJson(http.withParams("/translation", params)).then(res => res.json)
};
