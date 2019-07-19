import React from "react";
import { SelectInput } from "react-admin";

export const CatchmentSelectInput = props => {
  const choices = props.choices.filter(
    choice => !choice.name.endsWith("Master Catchment")
  );
  return <SelectInput {...props} choices={choices} />;
};
