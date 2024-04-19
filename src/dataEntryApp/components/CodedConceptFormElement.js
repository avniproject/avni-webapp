import React from "react";
import { CodedFormElement } from "./CodedFormElement";
import { sortBy, assign } from "lodash";

export const CodedConceptFormElement = ({ children: fe, validationResults, uuid, ...props }) => {
  return (
    <CodedFormElement
      name={fe.name}
      items={sortBy(fe.getAnswers(), "answerOrder").map(answer => assign(answer.concept, { abnormal: answer.abnormal }))}
      multiSelect={fe.type === "MultiSelect"}
      mandatory={fe.mandatory}
      validationResults={validationResults}
      uuid={uuid}
      disabled={!fe.editable}
      {...props}
    />
  );
};
