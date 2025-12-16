import { ToolTipContainer } from "./ToolTipContainer";
import { styled } from "@mui/material/styles";
import { FormControl as MuiFormControl } from "@mui/material";

const StyledFormControl = styled(MuiFormControl)({
  paddingBottom: "0.6rem",
  width: "100%",
  "& .MuiFormControlLabel-root": {
    marginRight: 0,
  },
});

export const AvniFormControl = ({ toolTipKey, styles, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={styles}>
      <StyledFormControl {...props}>{props.children}</StyledFormControl>
    </ToolTipContainer>
  );
};
