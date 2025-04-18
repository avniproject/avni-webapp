import React from "react";
import { SelectInput } from "react-admin";

export const CatchmentSelectInput = props => {
  return <SelectInput {...props} choices={props.choices} optionText="name" />;
};
