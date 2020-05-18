import React from "react";
import { BooleanInput } from "react-admin";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";

export const AvniBooleanInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <BooleanInput {...props} />
    </ToolTipContainer>
  );
};
