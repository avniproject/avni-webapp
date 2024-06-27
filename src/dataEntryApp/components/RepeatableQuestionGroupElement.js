import React from "react";
import { RepeatableQuestionGroup } from "openchs-models";
import QuestionGroupFormElement from "./QuestionGroupFormElement";
import _ from "lodash";
import Button from "@material-ui/core/Button";
import { LineBreak } from "../../common/components/utils";

function AddMoreButton({ addNewQuestionGroup, formElement }) {
  return <Button onClick={() => addNewQuestionGroup(formElement)} color="primary">{`Add One More - ${formElement.concept.name}`}</Button>;
}

function RemoveButton({ removeQuestionGroup, formElement, index }) {
  return (
    <Button onClick={() => removeQuestionGroup(formElement, index)} color="primary">
      {"Remove Above"}
    </Button>
  );
}

export function RepeatableQuestionGroupElement({
  formElement,
  obsHolder,
  validationResults,
  filteredFormElements,
  updateObs,
  addNewQuestionGroup,
  removeQuestionGroup
}) {
  let repeatableQuestionGroup = obsHolder.findObservation(formElement.concept);
  const hasNoObservation = _.isNil(repeatableQuestionGroup);
  if (hasNoObservation) repeatableQuestionGroup = new RepeatableQuestionGroup();
  const repeatableQuestionGroupValue = repeatableQuestionGroup.getValue();
  const hasMultipleElements = repeatableQuestionGroupValue.length > 1;
  const oneOfTheQuestionGroupObservationsIsEmpty = _.some(repeatableQuestionGroupValue, x => _.isEmpty(x.groupObservations));
  return repeatableQuestionGroupValue.map((x, index) => {
    const isLastElement =
      !hasNoObservation && !oneOfTheQuestionGroupObservationsIsEmpty && repeatableQuestionGroupValue.length === index + 1;
    const quesGrpValidationResults = validationResults.filter(itr => itr.questionGroupIndex === index);
    return (
      <div key={index}>
        <QuestionGroupFormElement
          formElement={formElement}
          filteredFormElements={filteredFormElements}
          obsHolder={obsHolder}
          updateObs={updateObs}
          validationResults={quesGrpValidationResults}
          isRepeatable={true}
          questionGroupIndex={index}
          key={index}
        />
        {(hasMultipleElements || isLastElement) && <LineBreak num={1} />}
        {!formElement.disableManualActions && (
          <>
            {hasMultipleElements && <RemoveButton formElement={formElement} index={index} removeQuestionGroup={removeQuestionGroup} />}
            {isLastElement && <AddMoreButton formElement={formElement} addNewQuestionGroup={addNewQuestionGroup} />}
          </>
        )}
        {!isLastElement && <LineBreak num={2} />}
      </div>
    );
  });
}
