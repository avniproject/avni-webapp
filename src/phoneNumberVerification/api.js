import { httpClient as http } from "common/utils/httpClient";
import { get } from "lodash";

export default {
  getMsg91Config: () => http.fetchJson("/web/msg91Config").then(response => response.json),
  updateMsg91Config: msg91Config =>
    http
      .postJson("/web/msg91Config", msg91Config)
      .then(r => [r.text, null])
      .catch(r => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`]),
  checkMsg91Authkey: msg91Config =>
    http
      .postJson("/web/msg91Config/check", msg91Config)
      .then(r => [r.data, null])
      .catch(r => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`])
};
