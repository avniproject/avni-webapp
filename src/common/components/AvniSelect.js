import Select from "@material-ui/core/Select";
import React from "react";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
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
