import { get } from "lodash";
import React from "react";
import { CodedConceptFormElement } from "./CodedConceptFormElement";

export default ({ formElement: fe, value, update }) => (
  <CodedConceptFormElement
    isChecked={answer => value === answer.uuid}
    onChange={answer => update(get(answer, "uuid"))}
  >
    {fe}
  </CodedConceptFormElement>
);
