import React from "react";
import { CodedFormElement } from "./CodedFormElement";
import { sortBy } from "lodash";

export const CodedConceptFormElement = ({ children: fe, validationResults, uuid, ...props }) => {
  return (
    <CodedFormElement
      groupName={fe.name}
      items={sortBy(fe.concept.answers, "answerOrder").map(answer => answer.concept)}
      multiSelect={fe.type === "MultiSelect"}
      mandatory={fe.mandatory}
      validationResults={validationResults}
      uuid={uuid}
      {...props}
    />
  );
};
