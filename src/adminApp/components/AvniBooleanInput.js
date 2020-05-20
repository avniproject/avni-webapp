import React from "react";
import { BooleanInput } from "react-admin";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";
import { Grid } from "@material-ui/core";

export const AvniBooleanInput = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <Grid component="label" container alignItems="center" spacing={2}>
        <BooleanInput {...props} />
      </Grid>
    </ToolTipContainer>
  );
};
