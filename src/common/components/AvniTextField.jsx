import { TextField } from "@mui/material";
import { ToolTipContainer } from "./ToolTipContainer";
import _ from "lodash";

export const AvniTextField = ({ toolTipKey, ...props }) => {
  const copy = { ...props };
  copy.value = _.isNil(copy.value) ? "" : copy.value;
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <TextField
        {...copy}
        sx={{
          backgroundColor: "white",
          "& .MuiInputBase-root": {
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "white"
            }
          },
          "& .MuiInputLabel-root": {
            backgroundColor: "white",
            padding: "0 4px",
            "&:hover": {
              backgroundColor: "white"
            }
          }
        }}
      />
    </ToolTipContainer>
  );
};
