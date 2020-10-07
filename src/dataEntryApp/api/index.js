import httpClient from "common/utils/httpClient";

export default {
  fetchOperationalModules: () =>
    httpClient.fetchJson("/web/operationalModules").then(response => response.json),
  fetchForm: uuid => httpClient.fetchJson(`/web/form/${uuid}`).then(response => response.json),
  fetchGenders: () => httpClient.fetchJson("/web/gender").then(response => response.json),
  fetchAllLocation: () => httpClient.fetchJson("/web/locations").then(response => response.json),
  fetchOrganisationConfigs: () =>
    httpClient.fetchJson("/web/organisationConfig").then(response => response.json),

  fetchRelations: () =>
    httpClient.fetchJson("/web/relationshipType").then(response => response.json),
  saveSubject: subject =>
    httpClient.fetchJson("/individuals", {
      method: "POST",
      body: JSON.stringify(subject)
    }),

  saveProgram: programEnrolment =>
    httpClient.fetchJson("/programEnrolments", {
      method: "POST",
      body: JSON.stringify(programEnrolment)
    }),

  searchResult: searchData =>
    httpClient.fetchJson("/web/searchAPI/v2", {
      method: "POST",
      body: JSON.stringify(searchData)
    }),

  saveProgramEncouter: programEncounter =>
    httpClient.fetchJson("/programEncounters", {
      method: "POST",
      body: JSON.stringify(programEncounter)
    }),

  saveRelationShip: Relationaldata =>
    httpClient.fetchJson("/individualRelationships", {
      method: "POST",
      body: JSON.stringify(Relationaldata)
    }),

  removeRelationShip: RelationId =>
    httpClient.fetchJson(`/web/relationShip/${RelationId}`, {
      method: "DELETE"
    }),

  saveEncounter: encounter =>
    httpClient.fetchJson("/encounters", {
      method: "POST",
      body: JSON.stringify(encounter)
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
  fetchProgramEnrolments: uuid => {
    return httpClient.fetchJson(`/web/programEnrolments/${uuid}`).then(response => response.json);
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
    }),
  fetchVisitSchedules: requestBody =>
    httpClient.post("/web/visitrule", requestBody).then(response => response.data.visitSchedules)
};
