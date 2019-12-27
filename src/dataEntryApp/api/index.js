import httpClient from "common/utils/httpClient";
import response from "./response";
import generalResponse from "./generalSubjectDashboardResponse";

export default {
  fetchOperationalModules: () =>
    httpClient.fetchJson("/web/operationalModules/").then(response => response.json),
  fetchForm: uuid => httpClient.fetchJson(`/web/form/${uuid}`).then(response => response.json),
  fetchGenders: () => httpClient.fetchJson("/web/gender/").then(response => response.json),
  saveSubject: subject =>
    httpClient.fetchJson("/individuals", {
      method: "POST",
      body: JSON.stringify(subject)
    }),
  fetchSubjectProfile: async () => {
    return response.data;
  },
  fetchSubjectGeneral: async () => {
    return generalResponse;
  },
  fetchSubjectProgram: uuid => {
    return httpClient.fetchJson(`/web/subject/${uuid}/programs/`).then(response => response.json);
  }

  // fetchSubjectGeneral: (uuid) => {
  //   httpClient.fetchJson(`/web/subject/${uuid}/encounters/`).then(response => response.json)
  // }
};
