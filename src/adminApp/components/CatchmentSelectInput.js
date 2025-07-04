import { AutocompleteInput } from "react-admin";

export const CatchmentSelectInput = props => {
  return <AutocompleteInput {...props} choices={props.choices} optionText="name" />;
};
