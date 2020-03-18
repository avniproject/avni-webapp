import http from "common/utils/httpClient";
import { get } from "lodash";

export default {
  fetchAllGroups: () => http.fetchJson("/web/groups").then(response => response.json),
  createGroups: name =>
    http
      .postJson("web/groups", { name })
      //returns [response, error]
      .then(r => [r.text, null])
      .catch(r => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`]),
  fetchGroupDetails: group_id => http.fetchJson(`/groups/${group_id}/users`)
};
