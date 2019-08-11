import React from "react";
import { LineBreak } from "../../common/components";
import TextFormElement from "./TextFormElement";
import SingleSelectFormElement from "./SingleSelectFormElement";
import MultiSelectFormElement from "./MultiSelectFormElement";
import NumericFormElement from "./NumericFormElement";
import DateFormElement from "./DateFormElement";

const div = () => <div />;

const elements = {
  Date: DateFormElement,
  DateTime: div,
  Time: div,
  Duration: div,
  SingleSelect: SingleSelectFormElement,
  MultiSelect: MultiSelectFormElement,
  Numeric: NumericFormElement,
  Boolean: div,
  Text: TextFormElement,
  Notes: div,
  NA: div,
  Image: div,
  Video: div,
  Id: div
};

export const FormElement = ({ children: formElement, value, update }) => {
  const type = formElement.getType();
  const props = { formElement, value, update };
  const Element = elements[type];
  return (
    <div>
      <LineBreak num={1} />
      <Element {...props} />
      <LineBreak num={1} />
    </div>
  );
};
