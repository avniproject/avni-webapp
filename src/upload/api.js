import { httpClient as http, httpClient } from "../common/utils/httpClient";
import files from "../common/utils/files";

export default {
  fetchUploadJobStatuses: (params = {}) =>
    httpClient
      .fetchJson(httpClient.withParams("/import/status", { size: 5, page: 0, ...params }))
      .then(r => r.json),
  bulkUpload: (type, file) => httpClient.uploadFile(http.withParams("/import/new", { type }), file),
  async downloadSample(type) {
    const file = await fetch(`/bulkuploads/sample/${type}.csv`);
    const content = await file.text();
    files.download(`sample-${type}.csv`, content);
  }
};
