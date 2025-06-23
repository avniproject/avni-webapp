import React from "react";
import { ToolTipContainer } from "./ToolTipContainer";
import { RadioButtonGroupInput } from "react-admin";
import { Grid } from "@mui/material";

export const AvniRadioButtonGroupInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={{ paddingTop: 5 }}>
      <Grid
        component="label"
        container
        spacing={2}
        sx={{
          alignItems: "center"
        }}
      >
        <RadioButtonGroupInput {...props} />
      </Grid>
    </ToolTipContainer>
  );
};
