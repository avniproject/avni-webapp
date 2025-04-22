export class WebConcept {
  name: string;
  uuid: string;
  dataType: string;
  keyValues: any[];
  answers: any[];
  active: boolean;
  mediaUrl: string;
  lowAbsolute: number;
  highAbsolute: number;
  lowNormal: number;
  highNormal: number;
  unit: string;
  createdBy: string;
  lastModifiedBy: string;
  creationDateTime: string;
  lastModifiedDateTime: string;

  static adjustOrderOfAnswers(concept: WebConcept) {
    concept.answers.forEach((answer, index) => {
      answer.order = index + 1;
    });
  }

  static validateNumericRanges(concept: WebConcept) {
    const error: {
      absoluteValidation?: boolean;
      normalValidation?: boolean;
      absoluteEncapsulationValidation?: boolean;
    } = {};
    if (
      concept.dataType === "Numeric" &&
      parseInt(concept.lowAbsolute as any) >
        parseInt(concept.highAbsolute as any)
    ) {
      error["absoluteValidation"] = true;
    }
    if (
      concept.dataType === "Numeric" &&
      parseInt(concept.lowNormal as any) > parseInt(concept.highNormal as any)
    ) {
      error["normalValidation"] = true;
    }
    if (
      concept.dataType === "Numeric" &&
      !(
        parseInt(concept.lowAbsolute as any) <=
          parseInt(concept.lowNormal as any) &&
        parseInt(concept.lowNormal as any) <=
          parseInt(concept.highNormal as any) &&
        parseInt(concept.highNormal as any) <=
          parseInt(concept.highAbsolute as any)
      )
    ) {
      error["normalValidation"] = true;
      error["absoluteValidation"] = true;
    }

    return error;
  }
}

export class WebConceptAnswer {
  uuid: string;
  name: string;
  unique: boolean;
  abnormal: boolean;
  editable: boolean;
  voided: boolean;
  order: number;
  mediaUrl: string;
}

export class WebConceptView extends WebConcept {
  unSavedMediaFile: File;
  answerUIViews: WebConceptAnswerView[];

  static emptyConcept() {
    const webConceptView = new WebConceptView();
    webConceptView.name = "";
    webConceptView.uuid = "";
    webConceptView.dataType = "";
    webConceptView.createdBy = "";
    webConceptView.lastModifiedBy = "";
    webConceptView.creationDateTime = "";
    webConceptView.lastModifiedDateTime = "";
    webConceptView.keyValues = [];
    webConceptView.answers = [WebConceptAnswerView.emptyAnswer()];
    return webConceptView;
  }
}

export class ConceptAnswerError {
  isErrored: boolean;
  type: string;

  static inError(type: string) {
    return { isErrored: true, type: type };
  }
}

export class WebConceptAnswerView extends WebConceptAnswer {
  unSavedMediaFile: File;
  isAnswerHavingError: ConceptAnswerError;

  static emptyAnswer() {
    const webConceptAnswerView = new WebConceptAnswerView();
    webConceptAnswerView.uuid = "";
    webConceptAnswerView.name = "";
    webConceptAnswerView.unique = false;
    webConceptAnswerView.abnormal = false;
    webConceptAnswerView.editable = true;
    webConceptAnswerView.voided = false;
    webConceptAnswerView.order = 0;
    webConceptAnswerView.isAnswerHavingError = ConceptAnswerError.inError("");
    return webConceptAnswerView;
  }
}

export default WebConcept;
