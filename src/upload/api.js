import { httpClient as http, httpClient } from "../common/utils/httpClient";

export default {
  fetchUploadJobStatuses: (params = {}) =>
    httpClient
      .fetchJson(httpClient.withParams("/import/status", { size: 5, page: 0, ...params }))
      .then(r => r.json),
  bulkUpload: (type, file) => httpClient.uploadFile(http.withParams("/import/new", { type }), file)
};
