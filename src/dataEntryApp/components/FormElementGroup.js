import { invoke } from "lodash";
import React from "react";
import { LineBreak } from "../../common/components/utils";
import { FormElement } from "./FormElement";

export const FormElementGroup = ({ children: feg, obs, updateObs }) => {
  return (
    <div>
      <h4>{feg.name}</h4>
      <LineBreak num={1} />
      {feg.getFormElements().map(fe => (
        <FormElement
          key={fe.uuid}
          concept={fe.concept}
          value={invoke(obs.findObservation(fe.concept), "getValue")}
          update={value => {
            updateObs(fe, value);
          }}
        >
          {fe}
        </FormElement>
      ))}
      <LineBreak num={1} />
    </div>
  );
};
