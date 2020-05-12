import httpClient from "common/utils/httpClient";

export default {
  fetchOperationalModules: () =>
    httpClient.fetchJson("/web/operationalModules").then(response => response.json),
  fetchForm: uuid => httpClient.fetchJson(`/web/form/${uuid}`).then(response => response.json),
  fetchGenders: () => httpClient.fetchJson("/web/gender").then(response => response.json),
  saveSubject: subject =>
    httpClient.fetchJson("/individuals", {
      method: "POST",
      body: JSON.stringify(subject)
    }),

  saveProgram: subject =>
    httpClient.fetchJson("/programEnrolments", {
      method: "POST",
      body: JSON.stringify(subject)
    }),

  fetchSubjectProfile: uuid =>
    httpClient.fetchJson(`/web/subjectProfile?uuid=${uuid}`).then(response => {
      return response.json;
    }),

  fetchPrograms: subjectUuid =>
    httpClient.fetchJson(`/web/eligiblePrograms?subjectUuid=${subjectUuid}`).then(response => {
      return response.json;
    }),

  fetchSubjectProgram: uuid => {
    return httpClient.fetchJson(`/web/subject/${uuid}/programs/`).then(response => response.json);
  },
  fetchSubjectGeneral: uuid => {
    return httpClient.fetchJson(`/web/subject/${uuid}/encounters/`).then(response => response.json);
  },
  fetchEnrolments: uuid => {
    return httpClient.fetchJson(`/api/enrolments/`).then(response => response.json);
  },

  fetchViewVisit: viewVisitUuid =>
    httpClient.fetchJson(`/web/programEncounter/${viewVisitUuid}`).then(response => {
      return response.json;
    }),
  fetchcompletedVisit: completedVisitUuid =>
    httpClient.fetchJson(`/web/programEnrolment/${completedVisitUuid}/completed`).then(response => {
      return response.json;
    })
};
