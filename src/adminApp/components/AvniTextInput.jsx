import { ToolTipContainer } from "../../common/components/ToolTipContainer";
import { StyledTextInput } from "../Util/Styles";

export const AvniTextInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <StyledTextInput {...props} />
      {props.children}
    </ToolTipContainer>
  );
};
