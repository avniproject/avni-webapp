import { httpClient } from "../common/utils/httpClient";
import { get } from "lodash";

export default {
  fetchOperationalModules: () =>
    httpClient.fetchJson("/web/operationalModules/").then(response => response.json),
  startExportJob: body =>
    httpClient
      .postJson("/export", body)
      .then(r => [r.text, null])
      .catch(r => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`]),
  fetchUploadJobStatuses: params =>
    httpClient
      .fetchJson(httpClient.withParams("/export/status", { size: 10, ...params }))
      .then(r => r.json),
  downloadFile: filename => httpClient.downloadFile("")
};
