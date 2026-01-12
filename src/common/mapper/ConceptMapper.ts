import { WebConceptAnswerView, WebConceptView } from "../model/WebConcept";

export class ConceptMapper {
  static mapFromResponse(conceptResponse: any) {
    let answers = [];
    if (
      conceptResponse.dataType === "Coded" &&
      conceptResponse.conceptAnswers
    ) {
      answers = conceptResponse.conceptAnswers.map((conceptAnswer: any) => {
        const webConceptAnswerView = new WebConceptAnswerView();
        webConceptAnswerView.name = conceptAnswer.answerConcept.name;
        webConceptAnswerView.uuid = conceptAnswer.answerConcept.uuid;
        webConceptAnswerView.unique = conceptAnswer.unique;
        webConceptAnswerView.abnormal = conceptAnswer.abnormal;
        webConceptAnswerView.order = conceptAnswer.order;
        webConceptAnswerView.voided = conceptAnswer.voided;
        webConceptAnswerView.media = conceptAnswer.answerConcept.media;
        return webConceptAnswerView;
      });
      answers = answers.filter((answer: any) => !answer.voided);
      answers.sort(function (conceptOrder1: any, conceptOrder2: any) {
        return conceptOrder1.order - conceptOrder2.order;
      });
    }

    const webConceptView = new WebConceptView();
    webConceptView.name = conceptResponse.name;
    webConceptView.uuid = conceptResponse.uuid;
    webConceptView.dataType = conceptResponse.dataType;
    webConceptView.active = conceptResponse.active;
    webConceptView.lowAbsolute = conceptResponse.lowAbsolute;
    webConceptView.highAbsolute = conceptResponse.highAbsolute;
    webConceptView.lowNormal = conceptResponse.lowNormal;
    webConceptView.highNormal = conceptResponse.highNormal;
    webConceptView.unit = conceptResponse.unit;
    webConceptView.createdBy = conceptResponse.createdBy;
    webConceptView.lastModifiedBy = conceptResponse.lastModifiedBy;
    webConceptView.creationDateTime = conceptResponse.createdDateTime;
    webConceptView.lastModifiedDateTime = conceptResponse.lastModifiedDateTime;
    webConceptView.keyValues = conceptResponse.keyValues;
    webConceptView.answers = answers;
    webConceptView.media = conceptResponse.media;
    webConceptView.organisationId = conceptResponse.organisationId;
    return webConceptView;
  }
}
