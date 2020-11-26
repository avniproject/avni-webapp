import { get, isNil, isEmpty } from "lodash";
import React from "react";
import { LineBreak } from "../../common/components/utils";
import { FormElement } from "./FormElement";
import { filterFormElements } from "../services/FormElementService";
import { useTranslation } from "react-i18next";

export const FormElementGroup = ({
  children: feg,
  obsHolder,
  updateObs,
  parentChildren,
  validationResults,
  filteredFormElements,
  entity,
  renderParent
}) => {
  const { t } = useTranslation();
  const formElements = isNil(filteredFormElements)
    ? filterFormElements(feg, entity)
    : filteredFormElements;
  const emptyNotice = <div>{t("noElements")}</div>;
  return (
    <div>
      <LineBreak num={1} />
      {parentChildren && renderParent ? parentChildren : ""}
      {isEmpty(formElements)
        ? emptyNotice
        : formElements.map(fe => {
            const observation = obsHolder.findObservation(fe.concept);
            const observationValue = observation
              ? observation.concept.isDurationConcept()
                ? get(observation, "valueJSON")
                : get(observation, "valueJSON.answer")
              : null;
            return (
              <FormElement
                key={fe.uuid}
                concept={fe.concept}
                obsHolder={obsHolder}
                value={observationValue}
                validationResults={validationResults}
                uuid={fe.uuid}
                update={value => {
                  updateObs(fe, value);
                }}
              >
                {fe}
              </FormElement>
            );
          })}
      <LineBreak num={1} />
    </div>
  );
};
