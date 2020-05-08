import React from "react";
import { ReferenceInput } from "react-admin";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";

export const AvniReferenceInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <ReferenceInput {...props} />
    </ToolTipContainer>
  );
};
