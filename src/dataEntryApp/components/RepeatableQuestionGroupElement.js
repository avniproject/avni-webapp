import React from "react";
import { RepeatableQuestionGroup } from "openchs-models";
import QuestionGroupFormElement from "./QuestionGroupFormElement";

export function RepeatableQuestionGroupElement({
  formElement,
  obsHolder,
  validationResults,
  filteredFormElements,
  updateObs
}) {
  const childObservations = obsHolder.findObservation(formElement.concept);
  const repeatableQuestionGroup = new RepeatableQuestionGroup(childObservations);
  return repeatableQuestionGroup.getValue().map(x => {
    return (
      <QuestionGroupFormElement
        formElement={formElement}
        filteredFormElements={filteredFormElements}
        obsHolder={obsHolder}
        updateObs={updateObs}
        validationResults={validationResults}
      />
    );
  });
}
