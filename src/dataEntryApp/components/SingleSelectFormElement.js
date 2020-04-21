import { get } from "lodash";
import React from "react";
import { CodedConceptFormElement } from "./CodedConceptFormElement";

export default ({ formElement: fe, value, update, validationResults, uuid }) => {
  return (
    <CodedConceptFormElement
      isChecked={answer => value === answer.uuid}
      onChange={answer => {
        update(get(answer, "uuid"));
      }}
      validationResults={validationResults}
      uuid={uuid}
      mandatory={fe.mandatory}
    >
      {fe}
    </CodedConceptFormElement>
  );
};
