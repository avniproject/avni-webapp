import { deburr } from "lodash";
import http from "../utils/httpClient";
import { MediaFolder, uploadImage } from "../utils/S3Client";
import { WebConceptAnswerView, WebConceptView } from "../model/WebConcept";

class ConceptService {
  static searchDashboardFilterConcepts(namePart) {
    const inputValue = deburr(namePart.trim()).toLowerCase();
    return http.get("/web/concept/dashboardFilter/search?namePart=" + encodeURIComponent(inputValue)).then(response => response.data);
  }

  static getAnswerConcepts(conceptUUID) {
    return http.get(`/concept/answerConcepts/search/find?conceptUUID=${conceptUUID}`).then(response => response.data.content);
  }

  static async saveConcept(concept, mediaFile) {
    let s3FileKey, error;
    if (mediaFile) {
      [s3FileKey, error] = await uploadImage(null, mediaFile, MediaFolder.METADATA);
    }
    await http.post("/concepts", [concept]);
  }

  static async getConcept(uuid) {
    return http.get("/web/concept/" + uuid).then(response => {
      let answers = [];
      if (response.data.dataType === "Coded" && response.data.conceptAnswers) {
        answers = response.data.conceptAnswers.map(conceptAnswer => {
          const webConceptAnswerView = new WebConceptAnswerView();
          webConceptAnswerView.name = conceptAnswer.answerConcept.name;
          webConceptAnswerView.uuid = conceptAnswer.answerConcept.uuid;
          webConceptAnswerView.unique = conceptAnswer.unique;
          webConceptAnswerView.abnormal = conceptAnswer.abnormal;
          webConceptAnswerView.order = conceptAnswer.order;
          webConceptAnswerView.voided = conceptAnswer.voided;
          return webConceptAnswerView;
        });
        answers.sort(function(conceptOrder1, conceptOrder2) {
          return conceptOrder1.order - conceptOrder2.order;
        });
      }

      const webConceptView = new WebConceptView();
      webConceptView.name = response.data.name;
      webConceptView.uuid = response.data.uuid;
      webConceptView.dataType = response.data.dataType;
      webConceptView.active = response.data.active;
      webConceptView.lowAbsolute = response.data.lowAbsolute;
      webConceptView.highAbsolute = response.data.highAbsolute;
      webConceptView.lowNormal = response.data.lowNormal;
      webConceptView.highNormal = response.data.highNormal;
      webConceptView.unit = response.data.unit;
      webConceptView.createdBy = response.data.createdBy;
      webConceptView.lastModifiedBy = response.data.lastModifiedBy;
      webConceptView.creationDateTime = response.data.createdDateTime;
      webConceptView.lastModifiedDateTime = response.data.lastModifiedDateTime;
      webConceptView.keyValues = response.data.keyValues;
      webConceptView.answers = answers;
      return webConceptView;
    });
  }
}

export default ConceptService;
