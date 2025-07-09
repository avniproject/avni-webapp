import SelectForm from "../../adminApp/SubjectType/SelectForm";

import { ToolTipContainer } from "./ToolTipContainer";

export const AvniSelectForm = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <SelectForm {...props} />
    </ToolTipContainer>
  );
};
