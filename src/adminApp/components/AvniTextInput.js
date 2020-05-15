import React from "react";
import { TextInput } from "react-admin";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";

export const AvniTextInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <TextInput {...props} />
      {props.children}
    </ToolTipContainer>
  );
};
