import React from "react";
import { AutocompleteArrayInput } from "react-admin";
import { localeChoices } from "../../common/constants";

export const LocaleSelectInput = props => {
  return <AutocompleteArrayInput {...props} choices={localeChoices} label="Languages" />;
};
