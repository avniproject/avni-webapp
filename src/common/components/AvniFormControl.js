import { StyledFormControl } from "../../formDesigner/components/FormElementDetails";
import { ToolTipContainer } from "./ToolTipContainer";

export const AvniFormControl = ({ toolTipKey, styles, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={styles}>
      <StyledFormControl {...props}>{props.children}</StyledFormControl>
    </ToolTipContainer>
  );
};
