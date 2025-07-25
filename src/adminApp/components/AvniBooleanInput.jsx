import { BooleanInput } from "react-admin";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";
import { Grid } from "@mui/material";

export const AvniBooleanInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <Grid
        component="label"
        container
        spacing={2}
        sx={{
          alignItems: "center"
        }}
      >
        <BooleanInput {...props} />
      </Grid>
    </ToolTipContainer>
  );
};
