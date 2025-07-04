import { SelectInput } from "react-admin";

export const CustomSelectInput = props => {
  const choices = props.choices;
  return <SelectInput {...props} choices={choices} />;
};
