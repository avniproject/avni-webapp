import { ToolTipContainer } from "./ToolTipContainer";
import { styled } from "@mui/material/styles";
import { FormControl as MuiFormControl } from "@mui/material";

const StyledFormControl = styled(MuiFormControl)({
  paddingBottom: 10,
  width: "100%"
});

export const AvniFormControl = ({ toolTipKey, styles, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={styles}>
      <StyledFormControl {...props}>{props.children}</StyledFormControl>
    </ToolTipContainer>
  );
};
