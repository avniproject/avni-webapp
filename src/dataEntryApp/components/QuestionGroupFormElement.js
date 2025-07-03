import React, { Fragment } from "react";
import { styled } from '@mui/material/styles';
import _, { filter, map, sortBy, get } from "lodash";
import { FormElement } from "./FormElement";
import { Concept, QuestionGroup } from "avni-models";
import { PrimitiveValue } from "openchs-models";

const StyledGridContainer = styled('div')({
  border: "1px solid rgba(0, 0, 0, 0.12)"
});

const StyledGridLabel = styled('div')({
  color: "rgba(0, 0, 0, 0.54)",
  flex: 0.5,
  marginRight: "15px",
  borderRight: "1px solid rgba(0, 0, 0, 0.12)"
});

function getQuestionGroupLabel(formElement, isRepeatable, repeatableIndex) {
  if (isRepeatable) return `${formElement.name} - ${repeatableIndex + 1}`;
  return formElement.name;
}

export default function QuestionGroupFormElement({
                                                   formElement,
                                                   obsHolder,
                                                   validationResults,
                                                   filteredFormElements,
                                                   updateObs,
                                                   isRepeatable = false,
                                                   questionGroupIndex
                                                 }) {
  const allChildren = sortBy(
    filter(
      filteredFormElements,
      ffe =>
        get(ffe, "group.uuid") === formElement.uuid &&
        !ffe.voided &&
        (_.isNil(questionGroupIndex) || ffe.questionGroupIndex === questionGroupIndex)
    ),
    "displayOrder"
  );
  const observation = obsHolder.findObservation(formElement.concept);
  let questionGroup;
  if (_.isNil(observation)) questionGroup = new QuestionGroup();
  else if (formElement.repeatable) questionGroup = observation.getValueWrapper().getGroupObservationAtIndex(questionGroupIndex);
  else questionGroup = observation.getValueWrapper();

  function getSelectedAnswer(childConcept, nullReplacement) {
    const observation = questionGroup.getObservation(childConcept);
    return _.isNil(observation) ? nullReplacement : _.get(observation.getValueWrapper(), "answer");
  }

  return (
    <Fragment>
      <StyledGridLabel>{getQuestionGroupLabel(formElement, isRepeatable, questionGroupIndex)}</StyledGridLabel>
      <StyledGridContainer>
        {map(allChildren, childFormElement => {
          let nullReplacement = Concept.dataType.Coded === childFormElement.concept.datatype ? new PrimitiveValue() : null;
          const value = _.includes(
            [Concept.dataType.Text, Concept.dataType.Numeric, Concept.dataType.Notes],
            childFormElement.concept.datatype
          )
            ? questionGroup.getValueForConcept(childFormElement.concept)
            : getSelectedAnswer(childFormElement.concept, nullReplacement);
          return (
            <FormElement
              key={childFormElement.uuid}
              concept={childFormElement.concept}
              obsHolder={obsHolder}
              value={value}
              validationResults={validationResults}
              uuid={childFormElement.uuid}
              update={newValue => {
                updateObs(formElement, newValue, childFormElement, questionGroupIndex);
              }}
              feIndex={childFormElement.displayOrder}
              filteredFormElements={filteredFormElements}
              ignoreLineBreak={true}
              isGrid={true}
            >
              {childFormElement}
            </FormElement>
          );
        })}
      </StyledGridContainer>
    </Fragment>
  );
}