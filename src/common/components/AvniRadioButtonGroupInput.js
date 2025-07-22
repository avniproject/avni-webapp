import { ToolTipContainer } from "./ToolTipContainer";
import { RadioButtonGroupInput } from "react-admin";
import { Box } from "@mui/material";

export const AvniRadioButtonGroupInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} sx={{ pt: 5 }}>
      <Box
        component="label"
        sx={{
          alignItems: "center"
        }}
      >
        <RadioButtonGroupInput {...props} />
      </Box>
    </ToolTipContainer>
  );
};
