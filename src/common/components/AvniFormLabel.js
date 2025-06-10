import { FormLabel } from "@mui/material";
import React from "react";
import { ToolTipContainer } from "./ToolTipContainer";
import _ from "lodash";

export const AvniFormLabel = ({ label, toolTipKey, style, position, ...props }) => {
  const copy = { ...props };
  copy.value = _.isNil(copy.value) ? "" : copy.value;
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={{ paddingTop: 10 }} position={position}>
      <FormLabel style={style || {}} {...copy}>
        {label}{" "}
      </FormLabel>
    </ToolTipContainer>
  );
};
