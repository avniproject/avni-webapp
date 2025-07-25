import { AutocompleteInput } from "react-admin";

export const CatchmentSelectInput = props => (
  <AutocompleteInput {...props} optionText="name" resettable />
);
