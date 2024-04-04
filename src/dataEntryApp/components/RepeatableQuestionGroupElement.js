import React from "react";
import { RepeatableQuestionGroup } from "openchs-models";
import QuestionGroupFormElement from "./QuestionGroupFormElement";
import _ from "lodash";

export function RepeatableQuestionGroupElement({
  formElement,
  obsHolder,
  validationResults,
  filteredFormElements,
  updateObs
}) {
  let repeatableQuestionGroup = obsHolder.findObservation(formElement.concept);
  if (_.isNil(repeatableQuestionGroup)) repeatableQuestionGroup = new RepeatableQuestionGroup();
  return repeatableQuestionGroup.getValue().map((x, index) => {
    return (
      <QuestionGroupFormElement
        formElement={formElement}
        filteredFormElements={filteredFormElements}
        obsHolder={obsHolder}
        updateObs={updateObs}
        validationResults={validationResults}
        isRepeatable={true}
        questionGroupIndex={index}
        key={index}
      />
    );
  });
}
