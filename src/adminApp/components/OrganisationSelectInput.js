import React from "react";
import { SelectInput } from "react-admin";

export const OrganisationSelectInput = props => {
  const choices = props.choices;
  return <SelectInput {...props} choices={choices} />;
};
