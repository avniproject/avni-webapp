import { Select, InputLabel, FormControl } from "@mui/material";

import { ToolTipContainer } from "./ToolTipContainer";

export const AvniSelect = ({ options, toolTipKey, isClearable, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <FormControl
        sx={{
          backgroundColor: "white",
          "& .MuiInputBase-root": {
            minWidth: "200px",
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "white"
            }
          },
          "& .MuiInputLabel-root": {
            backgroundColor: "white",
            padding: "0 4px",
            "&:hover": {
              backgroundColor: "white"
            }
          }
        }}
      >
        <InputLabel id={props.label}>{props.label}</InputLabel>
        <Select
          {...props}
          MenuProps={{ slotProps: { paper: { sx: { maxHeight: "20rem" } } } }}
        >
          {options}
        </Select>
        {props.children}
      </FormControl>
    </ToolTipContainer>
  );
};
