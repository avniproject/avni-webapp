import { SelectInput } from "react-admin";
import { styled } from "@mui/material/styles";

export const CustomSelectInput = styled(SelectInput)({
  display: "inline-block",
  width: "auto",
  "& .MuiInputBase-root": {
    backgroundColor: "white",
    width: "auto",
    minWidth: "140px"
  }
});
