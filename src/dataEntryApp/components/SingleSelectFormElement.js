import { get } from "lodash";
import React from "react";
import { CodedConceptFormElement } from "./CodedConceptFormElement";

export default ({ formElement: fe, value, update, validationResults, uuid }) => {
  // const [validationErrMessage, setValidationErrMessage] = React.useState("");

  // const setValidationResultToError = validationResult => {
  //   setValidationErrMessage(validationResult.messageKey);
  // };

  return (
    <CodedConceptFormElement
      isChecked={answer => value === answer.uuid}
      onChange={answer => {
        update(get(answer, "uuid"));
        //setValidationResultToError(fe.validate(answer));
      }}
      //errorMsg={validationErrMessage}
      validationResults={validationResults}
      uuid={uuid}
      mandatory={fe.mandatory}
    >
      {fe}
    </CodedConceptFormElement>
  );
};
