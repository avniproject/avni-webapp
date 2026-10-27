import { AutocompleteInput } from "react-admin";

export const CatchmentSelectInput = (props) => (
  <AutocompleteInput
    {...props}
    optionText="name"
    inputText={(option) => option?.name || ""}
    filterToQuery={(searchText) => ({ name: searchText })}
    resettable={true}
    sx={{
      "& .MuiInputBase-root": {
        backgroundColor: "white",
        minWidth: "120px",
      },
    }}
  />
);
