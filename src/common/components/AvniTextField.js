import TextField from "@material-ui/core/TextField";
import React from "react";
import { ToolTipContainer } from "./ToolTipContainer";

export const AvniTextField = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <TextField {...props} />
    </ToolTipContainer>
  );
};
