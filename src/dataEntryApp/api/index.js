import { httpClient } from "common/utils/httpClient";
import { get } from "lodash";
import MessageService from "../../common/service/MessageService";

export default {
  fetchForm: uuid => httpClient.fetchJson(`/web/form/${uuid}`).then(response => response.json),
  fetchRelationshipTypes: () => httpClient.fetchJson("/web/relationshipType").then(response => response.json),
  saveSubject: subject =>
    httpClient
      .fetchJson("/web/individuals", {
        method: "POST",
        body: JSON.stringify(subject)
      })
      .then(response => response.json),

  saveProgramEnrolment: programEnrolment =>
    httpClient
      .fetchJson("/web/programEnrolments", {
        method: "POST",
        body: JSON.stringify(programEnrolment)
      })
      .then(response => response.json),

  searchResult: searchData =>
    httpClient.fetchJson("/web/searchAPI/v2", {
      method: "POST",
      body: JSON.stringify(searchData)
    }),

  saveProgramEncouter: programEncounter =>
    httpClient
      .fetchJson("/web/programEncounters", {
        method: "POST",
        body: JSON.stringify(programEncounter)
      })
      .then(response => response.json),

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
    httpClient
      .fetchJson("/web/encounters", {
        method: "POST",
        body: JSON.stringify(encounter)
      })
      .then(response => response.json),

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
    httpClient
      .fetchJson(`/web/eligiblePrograms?subjectUuid=${subjectUuid}`)
      .then(response => {
        return response.json;
      })
      .catch(error => {
        return [];
      }),

  fetchEligibleEncounterTypes: subjectUUID =>
    httpClient
      .fetchJson(`/web/eligibleGeneralEncounters?subjectUUID=${subjectUUID}`)
      .then(response => {
        return response.json;
      })
      .catch(error => {
        return [];
      }),

  fetchEligibleProgramEncounterTypes: enrolmentUUID =>
    httpClient
      .fetchJson(`/web/eligibleProgramEncounters?enrolmentUUID=${enrolmentUUID}`)
      .then(response => {
        return response.json;
      })
      .catch(error => {
        return [];
      }),

  fetchEncounterTypeDetails: uuid => {
    return httpClient.fetchJson(`/web/encounterTypeDetails/${uuid}`).then(response => response.json);
  },

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
    httpClient.fetchJson(`/web/programEnrolment/${enrolmentUuid}/completed?${filterQueryString}`).then(response => {
      return response.json;
    }),
  fetchCompletedEncounters: (subjectUuid, filterQueryString) =>
    httpClient.fetchJson(`/web/subject/${subjectUuid}/completed?${filterQueryString}`).then(response => {
      return response.json;
    }),
  fetchProgramEnrolment: enrolmentUuid =>
    httpClient.fetchJson(`/web/programEnrolment/${enrolmentUuid}`).then(response => {
      return response.json;
    }),
  getRulesResponse: requestBody => httpClient.post("/web/rules", requestBody).then(response => response.data),
  getLegacyRulesBundle: () =>
    httpClient
      .get("/ruleDependency/search/lastModified?lastModifiedDateTime=1900-01-01T00:00:00.000Z&size=1000")
      .then(response => get(response, "data._embedded.ruleDependency[0].code")),
  getLegacyRules: () =>
    httpClient
      .get("/rule/search/lastModified?lastModifiedDateTime=1900-01-01T00:00:00.000Z&size=1000")
      .then(response => get(response, "data._embedded.rule")),
  fetchGroupMembers: groupUUID =>
    httpClient.fetchJson(`/web/groupSubjects/${groupUUID}/members`).then(response => {
      return response.json;
    }),
  fetchSubjectForUUIDs: uuids => httpClient.fetchJson(`/web/individual?uuids=${uuids}`).then(res => res.json),
  fetchGroupRoles: groupUUID =>
    httpClient.fetchJson(`/web/groupSubjects/${groupUUID}/roles`).then(response => {
      return response.json;
    }),
  fetchIdentifierAssignments: formUuid => httpClient.get(`/web/form/${formUuid}/identifierAssignments`).then(response => response.data),
  addEditGroupSubject: groupSubjectContract => httpClient.post("/groupSubjects", groupSubjectContract).then(response => response.data),
  deleteGroupSubject: uuid => httpClient.delete(`/groupSubjects/${uuid}`).then(response => response.data),
  voidSubject: uuid =>
    httpClient.delete(`/web/subject/${uuid}`).then(response => {
      return response.data;
    }),
  voidEncounter: uuid => httpClient.delete(`/web/encounter/${uuid}`).then(response => response.data),
  voidProgramEnrolment: uuid => httpClient.delete(`/web/programEnrolment/${uuid}`).then(response => response.data),
  voidProgramEncounter: uuid => httpClient.delete(`/web/programEncounter/${uuid}`).then(response => response.data),
  fetchCommentThreads: subjectUUID =>
    httpClient.fetchJson(`/web/commentThreads?subjectUUID=${subjectUUID}`).then(response => response.json),
  newCommentThread: payload => httpClient.post("/web/commentThread", payload).then(r => r.data),
  resolveThread: threadId => httpClient.put(`/web/commentThread/${threadId}/resolve`).then(r => r.data),
  newComment: payload => httpClient.post("/web/comment", payload).then(r => r.data),
  deleteComment: id => httpClient.delete(`/web/comment/${id}`).then(r => r.data),
  fetchCommentsForThread: threadId => httpClient.fetchJson(`/web/comment?commentThreadId=${threadId}`).then(r => r.json),
  editComment: comment => httpClient.put(`/web/comment/${comment.id}`, comment).then(r => r.json),
  getProgramSummary: enrolmentUUID =>
    httpClient.get(`/web/programSummaryRule?programEnrolmentUUID=${enrolmentUUID}`).then(response => response.data),
  getSubjectSummary: subjectUUID => httpClient.get(`/web/subjectSummaryRule?subjectUUID=${subjectUUID}`).then(response => response.data),
  getAllMessagesForSubject: function(subjectID) {
    return MessageService.getSubjectMessages(subjectID).then(response => response.data);
  },
  getAllMessagesForUser: userID => httpClient.get(`/web/contact/user/${userID}/msgs`).then(response => response.data),
  getAllMessagesNotYetSentForSubject: function(subjectID) {
    return httpClient.get(`/web/message/subject/${subjectID}/msgsNotYetSent`).then(response => response.data);
  },
  getAllMessagesNotYetSentForUser: userID => httpClient.get(`/web/message/user/${userID}/msgsNotYetSent`).then(response => response.data)
};
