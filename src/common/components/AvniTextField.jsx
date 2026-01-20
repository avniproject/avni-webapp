import { TextField } from "@mui/material";
import { ToolTipContainer } from "./ToolTipContainer";
import _ from "lodash";

export const AvniTextField = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <TextField
        {...props}
        value={_.isNil(props.value) ? "" : props.value}
        slotProps={{
          ...props.slotProps,
          htmlInput: {
            ...props.slotProps?.htmlInput,
            onWheel: (e) => e.target.blur(),
          },
        }}
        sx={{
          backgroundColor: "white",
          "& .MuiInputBase-root": {
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "white",
            },
          },
          "& .MuiInputLabel-root": {
            backgroundColor: "white",
            padding: "0 4px",
            "&:hover": {
              backgroundColor: "white",
            },
          },
        }}
      />
    </ToolTipContainer>
  );
};
