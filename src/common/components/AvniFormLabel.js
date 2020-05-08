import FormLabel from "@material-ui/core/FormLabel";
import React from "react";
import { ToolTipContainer } from "./ToolTipContainer";

export const AvniFormLabel = ({ label, toolTipKey, style }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={{ paddingTop: 10 }}>
      <FormLabel style={style || {}}>{label} </FormLabel>
    </ToolTipContainer>
  );
};
