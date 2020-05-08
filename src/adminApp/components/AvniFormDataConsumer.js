import React from "react";
import { FormDataConsumer } from "react-admin";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";

export const AvniFormDataConsumer = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <FormDataConsumer {...props}>{props.children}</FormDataConsumer>
    </ToolTipContainer>
  );
};
