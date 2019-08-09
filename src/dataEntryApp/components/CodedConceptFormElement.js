import React from "react";
import { CodedFormElement } from "./CodedFormElement";

export const CodedConceptFormElement = ({ children: fe, ...props }) => {
  return (
    <CodedFormElement
      groupName={fe.name}
      items={fe.concept.answers.map(answer => answer.concept)}
      multiSelect={fe.type === "MultiSelect"}
      {...props}
    />
  );
};
