import { Select, InputLabel, FormControl } from "@mui/material";
import React from "react";
import { ToolTipContainer } from "./ToolTipContainer";

export const AvniSelect = ({ options, toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <FormControl>
        <InputLabel id={props.label}>{props.label}</InputLabel>
        <Select {...props}>{options}</Select>
        {props.children}
      </FormControl>
    </ToolTipContainer>
  );
};
