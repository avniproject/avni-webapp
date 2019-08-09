import { includes, map } from "lodash";
import React from "react";
import { CodedConceptFormElement } from "./CodedConceptFormElement";

export default ({ formElement: fe, value, update }) => (
  <CodedConceptFormElement
    isChecked={answer => includes(value, answer.uuid)}
    onChange={answers => update(map(answers, "uuid"))}
  >
    {fe}
  </CodedConceptFormElement>
);
