import { BooleanInput } from "react-admin";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";
import { Box } from "@mui/material";

export const AvniBooleanInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          width: "200px",
          "& .MuiFormControlLabel-label": {
            fontSize: "14px"
          }
        }}
      >
        <BooleanInput {...props} />
      </Box>
    </ToolTipContainer>
  );
};
