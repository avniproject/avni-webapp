import _ from "lodash";
import React from "react";
import { CodedConceptFormElement } from "./CodedConceptFormElement";

export default ({ formElement: fe, value, update, validationResults, uuid }) => {
  return (
    <CodedConceptFormElement
      isChecked={answer => _.some(value, valueItr => valueItr === answer.uuid)}
      onChange={answer => {
        update(answer.uuid);
      }}
      validationResults={validationResults}
      uuid={uuid}
      mandatory={fe.mandatory}
    >
      {fe}
    </CodedConceptFormElement>
  );
};
