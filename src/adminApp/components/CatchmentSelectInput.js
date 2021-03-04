import React from "react";
import { AutocompleteInput } from "react-admin";

export const CatchmentSelectInput = props => {
  const choices = props.choices.filter(choice => !choice.name.endsWith("Master Catchment"));
  return <AutocompleteInput {...props} choices={choices} optionText="name" />;
};
