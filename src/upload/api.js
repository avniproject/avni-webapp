import http from "common/utils/httpClient";
import files from "common/utils/files";
import { get } from "lodash";

export default {
  fetchUploadJobStatuses: (params = {}) =>
    http
      .fetchJson(http.withParams("/import/status", { size: 5, page: 0, ...params }))
      .then(r => r.json),
  bulkUpload: (type, file) =>
    http
      .uploadFile(http.withParams("/import/new", { type }), file)
      //returns [response, error]
      .then(r => [r.text, null])
      .catch(r => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`]),
  async downloadSample(type) {
    const file = await fetch(`/bulkuploads/sample/${type}.csv`);
    const content = await file.text();
    files.download(`sample-${type}.csv`, content);
  }
};
