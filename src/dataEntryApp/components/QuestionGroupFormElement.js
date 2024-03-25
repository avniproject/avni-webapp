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

export default function QuestionGroupFormElement({
  formElement,
  obsHolder,
  validationResults,
  filteredFormElements,
  updateObs
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

  console.log("QuestionGroupFormElement", formElement.name);

  return (
    <Fragment>
      <div>{formElement.name}</div>
      <div style={{ flexDirection: "row", alignItems: "center", marginTop: "10px" }}>
        {map(textNumericAndNotes, cfe => (
          <FormElement
            key={cfe.uuid}
            concept={cfe.concept}
            obsHolder={obsHolder}
            value={getChildObservationValue(cfe.concept, childObservations)}
            validationResults={validationResults}
            uuid={cfe.uuid}
            update={value => {
              updateObs(formElement, value, cfe);
            }}
            feIndex={cfe.displayOrder}
            filteredFormElements={filteredFormElements}
            ignoreLineBreak={true}
            isGrid={true}
          >
            {cfe}
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
