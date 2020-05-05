import http from "common/utils/httpClient";
import { get } from "lodash";

export default {
  saveChecklistDetails: checklistDetails =>
    http
      .postJson("/checklistDetail", checklistDetails)
      .then(r => [r.status, null])
      .catch(r => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`]),

  getChecklistDetails: () => http.fetchJson("/web/checklistDetails")
};
