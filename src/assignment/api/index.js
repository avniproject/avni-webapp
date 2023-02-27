import http from "common/utils/httpClient";
import { get } from "lodash";

export default {
  getTaskMetadata: () => http.fetchJson("/web/taskMetadata").then(response => response.json),
  assignTask: payload =>
    http
      .post("/web/taskAssignment", payload)
      .then(r => [null])
      .catch(r => [`${get(r, "response.data") || get(r, "message") || "unknown error"}`]),
  getSubjects: payload => http.post("/web/subjectAssignment/search", payload),
  getSubjectAssignmentMetadata: () =>
    http.fetchJson("/web/subjectAssignmentMetadata").then(response => response.json),
  getAssignmentMetadata: () =>
    http.fetchJson("/web/assignmentMetadata").then(response => response.json),
  postUpdateUserAssignmentToSubject: payload =>
    http
      .post("/web/userSubjectAssignment", payload)
      .then(r => [null])
      .catch(r => [`${get(r, "response.data") || get(r, "message") || "unknown error"}`])
};
