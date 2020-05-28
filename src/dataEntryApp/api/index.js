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

  saveProgramEncouter: programEncounter =>
    httpClient.fetchJson("/programEncounters", {
      method: "POST",
      body: JSON.stringify(programEncounter)
    }),

  fetchProgramEncounter: uuid =>
    httpClient.fetchJson(`/web/programEncounter/${uuid}`).then(response => {
      return response.json;
    }),

  fetchEncounter: uuid =>
    httpClient.fetchJson(`/web/encounter/${uuid}`).then(response => {
      return response.json;
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
  fetchCompletedProgramEncounters: (enrolmentUuid, filterQueryString) =>
    httpClient
      .fetchJson(`/web/programEnrolment/${enrolmentUuid}/completed?${filterQueryString}`)
      .then(response => {
        return response.json;
      }),
  fetchCompletedEncounters: (subjectUuid, filterQueryString) =>
    httpClient
      .fetchJson(`/web/subject/${subjectUuid}/completed?${filterQueryString}`)
      .then(response => {
        return response.json;
      }),
  fetchProgramEnrolment: enrolmentUuid =>
    httpClient.fetchJson(`/web/programEnrolment/${enrolmentUuid}`).then(response => {
      return response.json;
    })
};
