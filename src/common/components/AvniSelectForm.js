import SelectForm from "../../adminApp/SubjectType/SelectForm";
import React from "react";
import { ToolTipContainer } from "./ToolTipContainer";

export const AvniSelectForm = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={{ paddingTop: 10 }}>
      <SelectForm {...props} />
    </ToolTipContainer>
  );
};
