import { httpClient } from "../common/utils/httpClient";

export default {
  fetchOperationalModules: () =>
    httpClient.fetchJson("/web/operationalModules/").then(response => response.json),
  startExportJob: body => httpClient.postJson("/export", body),
  fetchUploadJobStatuses: (params = {}) =>
    httpClient
      .fetchJson(httpClient.withParams("/export/status", { size: 20, page: 0, ...params }))
      .then(r => r.json),
  downloadFile: filename => httpClient.downloadFile("")
};
