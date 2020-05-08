import React from "react";
import { SelectInput } from "react-admin";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";

export const AvniSelectInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <SelectInput {...props} />
    </ToolTipContainer>
  );
};
