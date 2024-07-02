import http from "common/utils/httpClient";
import files from "common/utils/files";
import { get } from "lodash";

export default {
  fetchUploadJobStatuses: (params = {}) => {
    return http.fetchJson(http.withParams("/import/status", { size: 5, ...params })).then(r => r.json);
  },
  bulkUpload: (type, file, autoApprove, locationUploadMode, locationHierarchy) =>
    http
      .uploadFile(http.withParams("/import/new", { type, autoApprove, locationUploadMode, locationHierarchy }), file)
      //returns [response, error]
      .then(r => [r.text, null])
      .catch(r => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`]),
  fetchUploadTypes: () => {
    return http.fetchJson(http.withParams("/web/importTypes")).then(r => r.json);
  },
  fetchLocationHierarchies: () => {
    return http
      .fetchJson(http.withParams("/web/locationHierarchies"))
      .then(response => Object.entries(response.json).map(([value, label]) => ({ value, label })))
      .catch(() => []);
  },
  async downloadSample(type) {
    const file = await fetch(`/bulkuploads/sample/${type}.csv`);
    const content = await file.text();
    files.download(`sample-${type}.csv`, content);
  },
  downloadDynamicSample: type => http.downloadFile(`/web/importSample?uploadType=${type}`, `sample-${type}.csv`),
  downloadLocationsSample: (type, locationUploadMode, locationHierarchy) => {
    return http.downloadFile(
      `/web/importSample?uploadType=${type}&locationUploadMode=${locationUploadMode}&locationHierarchy=${locationHierarchy}`,
      `sample-${type}.csv`
    );
  }
};
