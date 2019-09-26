import { httpClient } from "../../common/utils/httpClient";

export default {
  fetchOrgConfig: () => httpClient.fetchJson("/organisationConfig").then(response => response.json)
};
