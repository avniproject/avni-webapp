import _, { invoke, get } from "lodash";
import React from "react";
import { LineBreak } from "../../common/components/utils";
import { FormElement } from "./FormElement";
import { ObservationsHolder, ValidationResults } from "avni-models";

export const FormElementGroup = ({ children: feg, obs, updateObs }) => {
  return (
    <div>
      <LineBreak num={1} />
      {feg.getFormElements().map(fe => (
        <FormElement
          key={fe.uuid}
          concept={fe.concept}
          obsHolder={obs}
          value={get(obs.findObservation(fe.concept), "valueJSON.answer")}
          update={value => {
            updateObs(fe, value);
            console.log("Inside FormElementGroup..");
            console.log(value);
            console.log(fe);
            console.log(fe.validate(value));
          }}
        >
          {fe}
        </FormElement>
      ))}
      <LineBreak num={1} />
    </div>
  );
};
