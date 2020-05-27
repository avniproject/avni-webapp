import React from "react";
import { ToolTipContainer } from "./ToolTipContainer";
import { RadioButtonGroupInput } from "react-admin";
import { Grid } from "@material-ui/core";

export const AvniRadioButtonGroupInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={{ paddingTop: 5 }}>
      <Grid component="label" container alignItems="center" spacing={2}>
        <RadioButtonGroupInput {...props} />
      </Grid>
    </ToolTipContainer>
  );
};
