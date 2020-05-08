import React from "react";
import { FormControl } from "../../formDesigner/components/FormElementDetails";
import { ToolTipContainer } from "./ToolTipContainer";

export const AvniFormControl = ({ toolTipKey, styles, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={styles}>
      <FormControl {...props}>{props.children}</FormControl>
    </ToolTipContainer>
  );
};
