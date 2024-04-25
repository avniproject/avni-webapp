import { get } from "lodash";
import React from "react";
import { LineBreak } from "../../common/components/utils";
import { FormElement } from "./FormElement";
import { getNonNestedFormElements } from "../services/FormElementService";

export const FormElementGroup = ({
  obsHolder,
  updateObs,
  children,
  validationResults,
  filteredFormElements,
  entity,
  renderChildren,
  addNewQuestionGroup,
  removeQuestionGroup
}) => {
  const nonNestedFormElements = getNonNestedFormElements(filteredFormElements);
  return (
    <div>
      <LineBreak num={1} />
      {children && renderChildren ? children : ""}

      {nonNestedFormElements.map((fe, index) => {
        const observation = obsHolder.findObservation(fe.concept);
        let observationValue;
        if (observation) {
          if (observation.concept.isDurationConcept()) {
            observationValue = get(observation, "valueJSON");
          } else if (observation.concept.isIdConcept()) {
            observationValue = get(observation, "valueJSON.value");
          } else {
            observationValue = get(observation, "valueJSON.answer");
          }
        } else {
          observationValue = null;
        }
        return (
          <FormElement
            key={fe.uuid}
            concept={fe.concept}
            obsHolder={obsHolder}
            value={observationValue}
            validationResults={validationResults}
            uuid={fe.uuid}
            update={(value, childFormElement) => {
              updateObs(fe, value, childFormElement);
            }}
            feIndex={index}
            filteredFormElements={filteredFormElements}
            updateObs={updateObs}
            addNewQuestionGroup={addNewQuestionGroup}
            removeQuestionGroup={removeQuestionGroup}
          >
            {fe}
          </FormElement>
        );
      })}
      <LineBreak num={1} />
    </div>
  );
};
