import { TextField } from "@mui/material";
import React from "react";
import { ToolTipContainer } from "./ToolTipContainer";
import _ from "lodash";

export const AvniTextField = ({ toolTipKey, ...props }) => {
  const copy = { ...props };
  copy.value = _.isNil(copy.value) ? "" : copy.value;
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <TextField {...copy} />
    </ToolTipContainer>
  );
};
