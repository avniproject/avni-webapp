import { Grid } from "@material-ui/core";
import Switch from "@material-ui/core/Switch";
import React from "react";
import { ToolTipContainer } from "./ToolTipContainer";

export const AvniSwitch = ({ toolTipKey, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={{ paddingTop: 10, marginLeft: "10px" }}>
      <Grid component="label" container alignItems="center" spacing={2}>
        <Grid>{props.name}</Grid>
        <Grid>
          <Switch {...props} />
        </Grid>
      </Grid>
    </ToolTipContainer>
  );
};
