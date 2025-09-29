import { AutocompleteInput } from "react-admin";

export const CatchmentSelectInput = (props) => (
  <AutocompleteInput
    {...props}
    optionText="name"
    filterToQuery={(searchText) => ({ name: searchText })}
    resettable="true"
    sx={{
      display: "inline-block",
      width: "auto",
      "& .MuiInputBase-root": {
        backgroundColor: "white",
        width: "auto",
        minWidth: "120px",
      },
    }}
  />
);
