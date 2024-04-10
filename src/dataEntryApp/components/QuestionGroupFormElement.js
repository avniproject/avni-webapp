import React, { Fragment } from "react";
import { filter, includes, map, sortBy, get } from "lodash";
import { FormElement } from "./FormElement";
import { Concept, QuestionGroup } from "avni-models";
import _ from "lodash";
import { PrimitiveValue } from "openchs-models";

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
  const textNumericAndNotes = filter(allChildren, ({ concept }) =>
    includes([Concept.dataType.Text, Concept.dataType.Numeric, Concept.dataType.Notes], concept.datatype)
  );
  const otherQuestions = filter(
    allChildren,
    ({ concept }) => !includes([Concept.dataType.Text, Concept.dataType.Numeric, Concept.dataType.Notes], concept.datatype)
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
      <div>{getQuestionGroupLabel(formElement, isRepeatable, questionGroupIndex)}</div>
      <div style={{ flexDirection: "row", alignItems: "center", marginTop: "10px" }}>
        {map(textNumericAndNotes, childFormElement => (
          <FormElement
            key={childFormElement.uuid}
            concept={childFormElement.concept}
            obsHolder={obsHolder}
            value={questionGroup.getValueForConcept(childFormElement.concept)}
            validationResults={validationResults}
            uuid={childFormElement.uuid}
            update={value => {
              updateObs(formElement, value, childFormElement, questionGroupIndex);
            }}
            feIndex={childFormElement.displayOrder}
            filteredFormElements={filteredFormElements}
            ignoreLineBreak={true}
            isGrid={true}
          >
            {childFormElement}
          </FormElement>
        ))}
      </div>
      <div style={{ marginRight: "15px" }}>
        {map(otherQuestions, childFormElement => (
          <div key={childFormElement.uuid} style={{ marginTop: "20px" }}>
            <FormElement
              concept={childFormElement.concept}
              obsHolder={obsHolder}
              value={getSelectedAnswer(childFormElement.concept, new PrimitiveValue())}
              validationResults={validationResults}
              uuid={childFormElement.uuid}
              update={value => {
                updateObs(formElement, value, childFormElement, questionGroupIndex);
              }}
              feIndex={childFormElement.displayOrder}
              filteredFormElements={filteredFormElements}
              ignoreLineBreak={true}
            >
              {childFormElement}
            </FormElement>
          </div>
        ))}
      </div>
    </Fragment>
  );
}
