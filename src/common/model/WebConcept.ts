export class WebConcept {
  name: string;
  uuid: string;
  dataType: string;
  keyValues: any[];
  answers: any[];
  active: boolean;
  media: any[];
  lowAbsolute: number;
  highAbsolute: number;
  lowNormal: number;
  highNormal: number;
  unit: string;
  createdBy: string;
  lastModifiedBy: string;
  creationDateTime: string;
  lastModifiedDateTime: string;
  organisationId: number;

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

    if (concept.dataType !== "Numeric") {
      return error;
    }

    // Convert empty strings to null
    const convertToNumberOrNull = (value: any) => {
      if (value === "" || value == null) return null;
      return Number(value);
    };

    // Get numeric values, converting empty strings to null
    const lowAbs = convertToNumberOrNull(concept.lowAbsolute);
    const highAbs = convertToNumberOrNull(concept.highAbsolute);
    const lowNorm = convertToNumberOrNull(concept.lowNormal);
    const highNorm = convertToNumberOrNull(concept.highNormal);

    const isNullOrLessThanOrEqual = (
      value: number | null,
      otherValue: number | null,
    ) => {
      return value === null || otherValue == null || value <= otherValue;
    };

    if (!isNullOrLessThanOrEqual(lowAbs, lowNorm)) {
      error["absoluteValidation"] = true;
      error["normalValidation"] = true;
    }
    let lowValue = lowNorm ? lowNorm : lowAbs;
    if (!isNullOrLessThanOrEqual(lowValue, highNorm)) {
      error["normalValidation"] = true;
    }
    lowValue = highNorm ? highNorm : lowValue;
    if (!isNullOrLessThanOrEqual(lowValue, highAbs)) {
      error["absoluteValidation"] = true;
      error["normalValidation"] = true;
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
  media: any[];
  organisationId: number;
}

export class WebConceptView extends WebConcept {
  unsavedImage: File;
  unsavedVideo: File;
  answerUIViews: WebConceptAnswerView[];

  static MaxImageFileSize = 150 * 1024; //150kB
  static MaxVideoFileSize = 10 * 1024 * 1024; //10mB

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
    webConceptView.organisationId = 0;
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
  unsavedImage: File;
  unsavedVideo: File;
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
    webConceptAnswerView.organisationId = 0;
    webConceptAnswerView.isAnswerHavingError = ConceptAnswerError.inError("");
    return webConceptAnswerView;
  }
}

export default WebConcept;
