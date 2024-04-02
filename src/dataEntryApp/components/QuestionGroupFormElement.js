import React, { Fragment } from "react";
import { filter, includes, map, sortBy, get } from "lodash";
import { FormElement } from "./FormElement";
import { Concept, QuestionGroup } from "avni-models";

function getChildObservationValue(concept, questionGroupObservation) {
  const qgObservationValue = questionGroupObservation
    ? questionGroupObservation.getValueWrapper()
    : new QuestionGroup();
  const childObs = qgObservationValue.findObservation(concept);
  return childObs && childObs.getValueWrapper().getValue();
}

function getQuestionGroupLabel(formElement, isRepeatable, repeatableIndex) {
  if (isRepeatable) return `${formElement.name} - ${repeatableIndex}`;
  return formElement.name;
}

export default function QuestionGroupFormElement({
  formElement,
  obsHolder,
  validationResults,
  filteredFormElements,
  updateObs,
  isRepeatable = false,
  repeatableIndex
}) {
  const allChildren = sortBy(
    filter(filteredFormElements, ffe => get(ffe, "group.uuid") === formElement.uuid && !ffe.voided),
    "displayOrder"
  );
  const textNumericAndNotes = filter(allChildren, ({ concept }) =>
    includes(
      [Concept.dataType.Text, Concept.dataType.Numeric, Concept.dataType.Notes],
      concept.datatype
    )
  );
  const otherQuestions = filter(
    allChildren,
    ({ concept }) =>
      !includes(
        [Concept.dataType.Text, Concept.dataType.Numeric, Concept.dataType.Notes],
        concept.datatype
      )
  );
  const childObservations = obsHolder.findObservation(formElement.concept);

  return (
    <Fragment>
      <div>{getQuestionGroupLabel(formElement, isRepeatable, repeatableIndex)}</div>
      <div style={{ flexDirection: "row", alignItems: "center", marginTop: "10px" }}>
        {map(textNumericAndNotes, childFormElement => (
          <FormElement
            key={childFormElement.uuid}
            concept={childFormElement.concept}
            obsHolder={obsHolder}
            value={getChildObservationValue(childFormElement.concept, childObservations)}
            validationResults={validationResults}
            uuid={childFormElement.uuid}
            update={value => {
              updateObs(formElement, value, childFormElement);
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
        {map(otherQuestions, fe => (
          <div key={fe.uuid} style={{ marginTop: "20px" }}>
            <FormElement
              concept={fe.concept}
              obsHolder={obsHolder}
              value={getChildObservationValue(fe.concept, childObservations)}
              validationResults={validationResults}
              uuid={fe.uuid}
              update={value => {
                updateObs(formElement, value, fe);
              }}
              feIndex={fe.displayOrder}
              filteredFormElements={filteredFormElements}
              ignoreLineBreak={true}
            >
              {fe}
            </FormElement>
          </div>
        ))}
      </div>
    </Fragment>
  );
}
