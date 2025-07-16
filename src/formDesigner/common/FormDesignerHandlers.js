import _, { cloneDeep, includes, isEmpty, replace, split } from "lodash";
import { default as UUID } from "uuid";
import http from "common/utils/httpClient";
import { alphabeticalSort, moveDown, moveUp, validateCodedConceptAnswers } from "../views/CreateEditConcept";

export const formDesignerUpdateConceptElementData = (draftFormElement, propertyName, value) => {
  draftFormElement["concept"][propertyName] = value;
};

export const formDesignerDeleteGroup = (draft, draftFormElementGroups, groupIndex) => {
  let form = draft.form;
  if (draftFormElementGroups[groupIndex].newFlag === true) {
    draftFormElementGroups.splice(groupIndex, 1);
  } else {
    draftFormElementGroups[groupIndex].voided = true;
    _.forEach(draftFormElementGroups[groupIndex].formElements, (group, index) => {
      group.voided = true;
    });
  }
  draft.createFlag = getCreateFlag(form);
  draft.detectBrowserCloseEvent = true;
};

export const getCreateFlag = form => {
  let groupFlag = true;
  _.forEach(form.formElementGroups, (groupElement, index) => {
    if (!groupElement.voided) {
      groupFlag = false;
    }
  });
  return groupFlag;
};

export const formDesignerDeleteFormElement = (draft, draftFormElements, elementIndex) => {
  const isQuestionGroupFormElement = draftFormElements[elementIndex].concept.dataType === "QuestionGroup";
  if (draftFormElements[elementIndex].newFlag === true) {
    let spliceCount = 1;
    if (isQuestionGroupFormElement) {
      spliceCount += _.filter(
        draftFormElements,
        fe => !_.isNil(fe.parentFormElementUuid) && fe.parentFormElementUuid === draftFormElements[elementIndex].uuid
      ).length;
    }
    draftFormElements.splice(elementIndex, spliceCount);
  } else {
    draftFormElements[elementIndex].voided = true;
    if (isQuestionGroupFormElement) {
      _.map(draftFormElements, fe => {
        if (!_.isNil(fe.parentFormElementUuid) && fe.parentFormElementUuid === draftFormElements[elementIndex].uuid) {
          fe.voided = true;
        }
      });
    }
  }
  draft.detectBrowserCloseEvent = true;
};

export const formDesignerAddFormElementGroup = (draft, draftFormElementGroups, groupIndex) => {
  draftFormElementGroups.splice(groupIndex + 1, 0, {
    uuid: UUID.v4(),
    newFlag: true,
    expanded: true,
    displayOrder: -1,
    name: "",
    display: "",
    voided: false,
    formElements: [formDesignerGetEmptyFormElement()]
  });
  draft.detectBrowserCloseEvent = true;
};

export const formDesignerAddFormElement = (draft, draftFormElements, elementIndex) => {
  draftFormElements.splice(elementIndex + 1, 0, formDesignerGetEmptyFormElement());
  draft.detectBrowserCloseEvent = true;
};

export const formDesignerHandleGroupElementChange = (draft, draftFormElementGroup, propertyName, value, elementIndex = -1) => {
  if (elementIndex === -1) {
    draftFormElementGroup[propertyName] = value;
  } else {
    draftFormElementGroup.formElements[elementIndex][propertyName] = value;
  }
  draft.detectBrowserCloseEvent = true;
};

export const formDesignerHandleInlineNumericAttributes = (draftFormElement, propertyName, value) => {
  draftFormElement["inlineNumericDataTypeAttributes"][propertyName] = value;
};

export const formDesignerHandleInlineCodedConceptAnswers = (draftFormElement, answerName, answerIndex) => {
  draftFormElement.inlineCodedAnswers[answerIndex].name = answerName;
};

export const formDesignerOnToggleInlineConceptCodedAnswerAttribute = (draftFormElement, propertyName, answerIndex) => {
  draftFormElement.inlineCodedAnswers[answerIndex][propertyName] = !draftFormElement.inlineCodedAnswers[answerIndex][propertyName];
};

export const formDesignerOnDeleteInlineConceptCodedAnswerDelete = (draftFormElement, answerIndex) => {
  draftFormElement.inlineCodedAnswers.splice(answerIndex, 1);
};

export const formDesignerOnConceptAnswerMoveUp = (draftFormElement, answerIndex) => {
  const conceptAnswers = draftFormElement.inlineCodedAnswers;
  draftFormElement.inlineCodedAnswers = moveUp(conceptAnswers, answerIndex);
};

export const formDesignerOnConceptAnswerMoveDown = (draftFormElement, answerIndex) => {
  const conceptAnswers = draftFormElement.inlineCodedAnswers;
  draftFormElement.inlineCodedAnswers = moveDown(conceptAnswers, answerIndex);
};

export const formDesignerOnConceptAnswerAlphabeticalSort = draftFormElement => {
  const conceptAnswers = draftFormElement.inlineCodedAnswers;
  draftFormElement.inlineCodedAnswers = alphabeticalSort(conceptAnswers);
};

export const formDesignerHandleInlineConceptAttributes = (draftFormElement, attributeName, propertyName, value) => {
  draftFormElement[attributeName][propertyName] = value;
};

export const formDesignerHandleInlineCodedAnswerAddition = draftFormElement => {
  draftFormElement.inlineCodedAnswers.push({
    name: "",
    uuid: "",
    unique: false,
    abnormal: false,
    editable: true,
    voided: false,
    order: 0,
    isAnswerHavingError: { isErrored: false, type: "" }
  });
};

export const formDesignerHandleGroupElementKeyValueChange = (draft, draftFormElement, propertyName, value) => {
  if (includes(["IdSourceUUID", "unique", "groupSubjectTypeUUID", "groupSubjectRoleUUID"], propertyName)) {
    draftFormElement.keyValues[propertyName] = value;
  } else if (propertyName === "editable") {
    value === "undefined" ? (draftFormElement.keyValues[propertyName] = false) : delete draftFormElement.keyValues[propertyName];
  } else if (["datePickerMode", "timePickerMode"].includes(propertyName)) {
    draftFormElement.keyValues[propertyName] = value;
  } else if (
    propertyName === "maxHeight" ||
    propertyName === "maxWidth" ||
    propertyName === "imageQuality" ||
    propertyName === "videoQuality"
  ) {
    draftFormElement.keyValues[propertyName] = value;
  } else if (propertyName === "durationLimitInSecs") {
    draftFormElement.keyValues[propertyName] = _.toNumber(value);
  } else if (
    propertyName === "years" ||
    propertyName === "months" ||
    propertyName === "days" ||
    propertyName === "weeks" ||
    propertyName === "hours" ||
    propertyName === "minutes"
  ) {
    if (!Object.keys(draftFormElement.keyValues).includes("durationOptions")) {
      draftFormElement.keyValues["durationOptions"] = [];
    }
    if (draftFormElement.keyValues["durationOptions"].includes(propertyName)) {
      draftFormElement.keyValues["durationOptions"].splice(draftFormElement.keyValues["durationOptions"].indexOf(propertyName), 1);
    } else {
      draftFormElement.keyValues["durationOptions"].push(value);
    }
  } else if (propertyName === "regex" || propertyName === "descriptionKey") {
    if (!draftFormElement.validFormat) {
      draftFormElement.validFormat = {};
    }
    if (value) value = value.trim();
    draftFormElement.validFormat[propertyName] = value;
  } else {
    draftFormElement.keyValues[propertyName] = value;
  }

  draft.detectBrowserCloseEvent = true;
};

export const formDesignerHandleExcludedAnswers = (draft, draftFormElement, name, status) => {
  _.forEach(draftFormElement.concept.answers, answer => {
    if (answer.name === name) {
      if (status !== false) answer["excluded"] = status;
      else delete answer.excluded;
      return answer;
    }
  });
  draft.detectBrowserCloseEvent = true;
};

export const formDesignerHandleModeForDate = (draftFormElement, propertyName, value) => {
  value === "durationOptions" ? delete draftFormElement.keyValues["datePickerMode"] : delete draftFormElement.keyValues["durationOptions"];
  draftFormElement[propertyName] = value;
};

export const formDesignerHandleRegex = (draftFormElement, propertyName, value) => {
  value === "no" && delete draftFormElement.validFormat;
  draftFormElement[propertyName] = value;
};

export const formDesignerHandleConceptFormLibrary = (draftFormElement, value, inlineConcept = false) => {
  if (inlineConcept) {
    draftFormElement.showConceptLibrary = value;
    draftFormElement.inlineConceptErrorMessage = formDesignerGetEmptyFormElement().inlineConceptErrorMessage;
    draftFormElement.inlineNumericDataTypeAttributes = formDesignerGetEmptyFormElement().inlineNumericDataTypeAttributes;
    draftFormElement.inlineCodedAnswers = formDesignerGetEmptyFormElement().inlineCodedAnswers;
    draftFormElement.inlineLocationDataTypeKeyValues = formDesignerGetEmptyFormElement().inlineLocationDataTypeKeyValues;
    draftFormElement.inlineConceptName = "";
    draftFormElement.inlineConceptDataType = "";
    draftFormElement.concept = formDesignerGetEmptyFormElement().concept;
    draftFormElement.errorMessage = formDesignerGetEmptyFormElement().errorMessage;
  } else {
    draftFormElement.showConceptLibrary = value;
  }
};

const formDesignerOnSubmitInlineConcept = (inlineConceptObject, formElement, updateState) => {
  inlineConceptObject.answers.forEach((answer, index) => {
    answer.order = index;
  });
  http
    .post("/concepts", inlineConceptObject)
    .then(response => {
      if (response.status === 200) {
        formElement["concept"].name = inlineConceptObject.name;
        formElement["concept"]["uuid"] = inlineConceptObject.uuid;
        formElement["concept"].dataType = inlineConceptObject.dataType;
        formElement.showConceptLibrary = "chooseFromLibrary";
        formElement["concept"].lowAbsolute = inlineConceptObject.lowAbsolute;
        formElement["concept"].highAbsolute = inlineConceptObject.highAbsolute;
        formElement["concept"].lowNormal = inlineConceptObject.lowNormal;
        formElement["concept"].highNormal = inlineConceptObject.highNormal;
        formElement["concept"].unit = inlineConceptObject.unit;
        formElement["concept"].answers = inlineConceptObject.answers;
        formElement.newFlag = false;
        updateState();
      }
    })
    .catch(error => {
      const errorMessage = split(replace(error.response.data, /^org\..*: /, ""), /\n|\r/, 1);
      formElement.inlineConceptErrorMessage["inlineConceptError"] = errorMessage;
      updateState();
    });
};

export const formDesignerOnSaveInlineConcept = (clonedFormElement, updateState) => {
  let absoluteValidation = false,
    normalValidation = false,
    locationValidation = false,
    subjectValidation = false,
    encounterTypeUUIDValidation = false,
    encounterScopeValidation = false,
    encounterIdentifierValidation = false;

  const inlineConceptObject = {
    name: clonedFormElement.inlineConceptName,
    uuid: UUID.v4(),
    dataType: clonedFormElement.inlineConceptDataType,
    lowAbsolute: clonedFormElement["inlineNumericDataTypeAttributes"].lowAbsolute,
    highAbsolute: clonedFormElement["inlineNumericDataTypeAttributes"].highAbsolute,
    lowNormal: clonedFormElement["inlineNumericDataTypeAttributes"].lowNormal,
    highNormal: clonedFormElement["inlineNumericDataTypeAttributes"].highNormal,
    unit:
      clonedFormElement["inlineNumericDataTypeAttributes"].unit === "" ? null : clonedFormElement["inlineNumericDataTypeAttributes"].unit,
    answers: clonedFormElement["inlineCodedAnswers"]
  };

  if (inlineConceptObject.dataType === "Location") {
    if (clonedFormElement["inlineLocationDataTypeKeyValues"].lowestAddressLevelTypeUUIDs.length === 0) {
      locationValidation = true;
    } else {
      const keyValues = [];
      keyValues[0] = {
        key: "isWithinCatchment",
        value: clonedFormElement["inlineLocationDataTypeKeyValues"].isWithinCatchment
      };
      keyValues[1] = {
        key: "lowestAddressLevelTypeUUIDs",
        value: clonedFormElement["inlineLocationDataTypeKeyValues"].lowestAddressLevelTypeUUIDs
      };
      if (!isEmpty(clonedFormElement["inlineLocationDataTypeKeyValues"].highestAddressLevelTypeUUID)) {
        keyValues[2] = {
          key: "highestAddressLevelTypeUUID",
          value: clonedFormElement["inlineLocationDataTypeKeyValues"].highestAddressLevelTypeUUID
        };
      }
      inlineConceptObject.keyValues = keyValues;
    }
  }

  if (inlineConceptObject.dataType === "Subject") {
    if (isEmpty(clonedFormElement["inlineSubjectDataTypeKeyValues"].subjectTypeUUID)) {
      subjectValidation = true;
    } else {
      const keyValues = [];
      keyValues[0] = {
        key: "subjectTypeUUID",
        value: clonedFormElement["inlineSubjectDataTypeKeyValues"].subjectTypeUUID
      };
      inlineConceptObject.keyValues = keyValues;
    }
  }

  if (inlineConceptObject.dataType === "Encounter") {
    const getValue = key => clonedFormElement["inlineEncounterDataTypeKeyValues"][key];
    const isKeyEmpty = key => isEmpty(getValue(key));
    if (isKeyEmpty("encounterTypeUUID")) {
      encounterTypeUUIDValidation = true;
    } else if (isKeyEmpty("encounterScope")) {
      encounterScopeValidation = true;
    } else if (isKeyEmpty("encounterIdentifier")) {
      encounterIdentifierValidation = true;
    } else {
      const keyValues = [];
      keyValues[0] = { key: "encounterTypeUUID", value: getValue("encounterTypeUUID") };
      keyValues[1] = { key: "encounterScope", value: getValue("encounterScope") };
      keyValues[2] = { key: "encounterIdentifier", value: getValue("encounterIdentifier") };
      inlineConceptObject.keyValues = keyValues;
    }
  }

  if (inlineConceptObject.dataType === "PhoneNumber") {
    const keyValues = [];
    keyValues.push({
      key: "verifyPhoneNumber",
      value: clonedFormElement["inlinePhoneNumberDataTypeKeyValues"].verifyPhoneNumber
    });
    inlineConceptObject.keyValues = keyValues;
  }

  if (inlineConceptObject.dataType === "Numeric") {
    // Convert empty strings to null
    const convertToNumberOrNull = value => {
      if (value === "" || value == null) return null;
      return Number(value);
    };

    // Get numeric values, converting empty strings to null
    const lowAbs = convertToNumberOrNull(inlineConceptObject.lowAbsolute);
    const highAbs = convertToNumberOrNull(inlineConceptObject.highAbsolute);
    const lowNorm = convertToNumberOrNull(inlineConceptObject.lowNormal);
    const highNorm = convertToNumberOrNull(inlineConceptObject.highNormal);

    // Initialize validation flags
    absoluteValidation = false;
    normalValidation = false;

    // Helper function to check if values maintain proper ordering
    const isNullOrLessThanOrEqual = (value, otherValue) => {
      return value === null || otherValue === null || value <= otherValue;
    };

    // Check encapsulation rules
    if (!isNullOrLessThanOrEqual(lowAbs, lowNorm)) {
      absoluteValidation = true;
      normalValidation = true;
    }
    let lowValue = lowNorm ? lowNorm : lowAbs;
    if (!isNullOrLessThanOrEqual(lowValue, highNorm)) {
      normalValidation = true;
    }
    lowValue = highNorm ? highNorm : lowValue;
    if (!isNullOrLessThanOrEqual(lowValue, highAbs)) {
      absoluteValidation = true;
      normalValidation = true;
    }
  }

  if (
    inlineConceptObject.dataType !== "" &&
    inlineConceptObject.name.trim() !== "" &&
    normalValidation === false &&
    absoluteValidation === false &&
    locationValidation === false &&
    subjectValidation === false &&
    encounterTypeUUIDValidation === false &&
    encounterScopeValidation === false &&
    encounterIdentifierValidation === false
  ) {
    clonedFormElement.inlineConceptErrorMessage["name"] = "";
    clonedFormElement.inlineConceptErrorMessage["dataType"] = "";
    clonedFormElement.inlineConceptErrorMessage["inlineConceptError"] = "";

    if (inlineConceptObject.dataType === "Coded") {
      const length = inlineConceptObject.answers.length;
      let counter = 0;
      let flagForInvalidAnswer = false;
      if (length === 0) {
        formDesignerOnSubmitInlineConcept(inlineConceptObject, clonedFormElement, updateState);
      }
      validateCodedConceptAnswers(inlineConceptObject.answers);
      if (inlineConceptObject.answers.some(answer => answer["isAnswerHavingError"].isErrored)) {
        flagForInvalidAnswer = true;
        clonedFormElement.inlineConceptErrorMessage["inlineConceptError"] = "One or more invalid answer values specified for Coded Concept";
      }
      if (flagForInvalidAnswer === true) {
        updateState();
      } else {
        inlineConceptObject.answers.forEach(answer => {
          http
            .get(`/web/concept?name=${encodeURIComponent(answer.name)}`)
            .then(response => {
              if (response.status === 200) {
                answer.uuid = response.data.uuid;
                answer.order = counter;
                counter = counter + 1;

                if (counter === length) {
                  formDesignerOnSubmitInlineConcept(inlineConceptObject, clonedFormElement, updateState);
                }
              }
            })
            .catch(error => {
              if (error.response.status === 404) {
                answer.uuid = UUID.v4();
                http
                  .post("/concepts", {
                    name: answer.name,
                    uuid: answer.uuid,
                    dataType: "NA",
                    lowAbsolute: null,
                    highAbsolute: null,
                    lowNormal: null,
                    highNormal: null,
                    unit: null
                  })
                  .then(response => {
                    if (response.status === 200) {
                      console.log("Dynamic concept added through Coded", response);
                      counter = counter + 1;
                      if (counter === length) {
                        formDesignerOnSubmitInlineConcept(inlineConceptObject, clonedFormElement, updateState);
                      }
                    }
                  });
              } else {
                console.log(error);
              }
            });
        });
      }
    } else {
      formDesignerOnSubmitInlineConcept(inlineConceptObject, clonedFormElement, updateState);
    }
  } else {
    clonedFormElement.inlineConceptErrorMessage["name"] = inlineConceptObject.name.trim() === "" ? "concept name is required" : "";
    clonedFormElement.inlineConceptErrorMessage["dataType"] = inlineConceptObject.dataType === "" ? "concept datatype is required" : "";
    clonedFormElement.inlineNumericDataTypeAttributes.error["normalValidation"] = normalValidation;
    clonedFormElement.inlineNumericDataTypeAttributes.error["absoluteValidation"] = absoluteValidation;
    clonedFormElement.inlineLocationDataTypeKeyValues.error["lowestAddressLevelRequired"] = locationValidation;
    clonedFormElement.inlineSubjectDataTypeKeyValues.error["subjectTypeRequired"] = subjectValidation;
    clonedFormElement.inlineEncounterDataTypeKeyValues.error["encounterTypeRequired"] = encounterTypeUUIDValidation;
    clonedFormElement.inlineEncounterDataTypeKeyValues.error["encounterScopeRequired"] = encounterScopeValidation;
    clonedFormElement.inlineEncounterDataTypeKeyValues.error["encounterIdentifierRequired"] = encounterIdentifierValidation;

    updateState();
  }
};

export const formDesignerUpdateDragDropOrderForFirstGroup = (
  draft,
  draftSourceFormElementGroup,
  draftDestinationFormElementGroup,
  groupSourceIndex,
  groupDestinationIndex,
  sourceElementIndex,
  destinationElementIndex
) => {
  let counter = 0;
  if (groupSourceIndex !== groupDestinationIndex) {
    const sourceElement = cloneDeep(draftSourceFormElementGroup.formElements[sourceElementIndex]);
    sourceElement.uuid = UUID.v4();
    if (destinationElementIndex !== 0) {
      draftDestinationFormElementGroup.formElements.forEach((element, index) => {
        if (!element.voided) {
          counter += 1;
          if (counter === destinationElementIndex) {
            draftDestinationFormElementGroup.formElements.splice(index + 1, 0, sourceElement);
          }
        }
      });
    } else {
      draftDestinationFormElementGroup.formElements.splice(destinationElementIndex, 0, sourceElement);
    }
    draftSourceFormElementGroup.formElements[sourceElementIndex].voided = true;
  } else {
    draftSourceFormElementGroup.formElements.forEach((element, index) => {
      if (!element.voided) {
        if (counter === destinationElementIndex) {
          const sourceElement = draftSourceFormElementGroup.formElements.splice(sourceElementIndex, 1)[0];
          draftSourceFormElementGroup.formElements.splice(index, 0, sourceElement);
        }
        counter += 1;
      }
    });
  }
  draft.detectBrowserCloseEvent = true;
};

export const formDesignerGetEmptyFormElement = () => {
  return {
    uuid: UUID.v4(),
    displayOrder: -1,
    newFlag: true,
    name: "",
    type: "",
    keyValues: {},
    mandatory: false,
    voided: false,
    expanded: true,
    concept: { name: "", dataType: "" },
    errorMessage: { name: false, concept: false, type: false },
    inlineConceptErrorMessage: { name: "", dataType: "", inlineConceptError: "" },
    inlineNumericDataTypeAttributes: {
      lowAbsolute: null,
      highAbsolute: null,
      lowNormal: null,
      highNormal: null,
      unit: "",
      error: {}
    },
    inlineCodedAnswers: [
      {
        name: "",
        uuid: "",
        unique: false,
        abnormal: false,
        editable: true,
        voided: false,
        order: 0,
        isAnswerHavingError: { isErrored: false, type: "" }
      }
    ],
    showConceptLibrary: "",
    inlineConceptName: "",
    inlineConceptDataType: "",
    inlineLocationDataTypeKeyValues: {
      isWithinCatchment: true,
      lowestAddressLevelTypeUUIDs: [],
      highestAddressLevelTypeUUID: "",
      error: {}
    },
    inlineSubjectDataTypeKeyValues: {
      subjectTypeUUID: "",
      error: {}
    },
    inlineEncounterDataTypeKeyValues: {
      error: {},
      encounterTypeUUID: "",
      encounterScope: "",
      encounterIdentifier: ""
    },
    inlinePhoneNumberDataTypeKeyValues: {
      verifyPhoneNumber: false
    }
  };
};
