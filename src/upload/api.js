import { httpClient } from "../common/utils/httpClient";

export default {
  fetchUploadJobStatuses: (params = {}) =>
    httpClient
      .fetchJson(httpClient.withParams("/import/status", { size: 5, page: 0, ...params }))
      .then(r => r.json)
};
