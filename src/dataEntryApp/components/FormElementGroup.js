import _, { invoke, get } from "lodash";
import React from "react";
import { LineBreak } from "../../common/components/utils";
import { FormElement } from "./FormElement";
import { ObservationsHolder, ValidationResults } from "avni-models";

export const FormElementGroup = ({ children: feg, obs, updateObs }) => {
  const [validationErrMessage, setValidationErrMessage] = React.useState("");

  const setValidationResultToError = validationResult => {
    setValidationErrMessage(validationResult.messageKey);
  };

  return (
    <div>
      <LineBreak num={1} />
      {feg.getFormElements().map(fe => (
        <FormElement
          key={fe.uuid}
          concept={fe.concept}
          obsHolder={obs}
          value={get(obs.findObservation(fe.concept), "valueJSON.answer")}
          validationErrMessage={validationErrMessage}
          update={value => {
            updateObs(fe, value);
            console.log("Before validate..");
            console.log(fe.validate(value));
            setValidationResultToError(fe.validate(value));
          }}
        >
          {fe}
        </FormElement>
      ))}
      <LineBreak num={1} />
    </div>
  );
};
