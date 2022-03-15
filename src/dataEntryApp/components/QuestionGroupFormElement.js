import React, { Fragment } from "react";
import { filter, includes, map, sortBy } from "lodash";
import { FormElement } from "./FormElement";
import { Concept, QuestionGroup } from "avni-models";

const QuestionGroupFormElement = ({
  formElement,
  obsHolder,
  validationResults,
  filteredFormElements,
  updateObs
}) => {
  const allChildren = sortBy(
    filter(filteredFormElements, ffe => ffe.groupUuid === formElement.uuid && !ffe.voided),
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

  const getChildObservationValue = concept => {
    const childObservationsValue = childObservations
      ? childObservations.getValueWrapper()
      : new QuestionGroup();
    const childObs = childObservationsValue.findObservation(concept);
    return childObs && childObs.getValueWrapper().getValue();
  };

  return (
    <Fragment>
      <div>{formElement.name}</div>
      <div style={{ flexDirection: "row", alignItems: "center", marginTop: "10px" }}>
        {map(textNumericAndNotes, cfe => (
          <FormElement
            key={cfe.uuid}
            concept={cfe.concept}
            obsHolder={obsHolder}
            value={getChildObservationValue(cfe.concept)}
            validationResults={validationResults}
            uuid={cfe.uuid}
            update={value => {
              updateObs(formElement, value, cfe);
            }}
            feIndex={cfe.displayOrder}
            filteredFormElements={filteredFormElements}
            isChildFormElement={true}
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
              value={getChildObservationValue(fe.concept)}
              validationResults={validationResults}
              uuid={fe.uuid}
              update={value => {
                updateObs(formElement, value, fe);
              }}
              feIndex={fe.displayOrder}
              filteredFormElements={filteredFormElements}
              isChildFormElement={true}
              ignoreLineBreak={true}
            >
              {fe}
            </FormElement>
          </div>
        ))}
      </div>
    </Fragment>
  );
};

export default QuestionGroupFormElement;
