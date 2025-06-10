import { Grid, Switch } from "@mui/material";
import React from "react";
import { ToolTipContainer } from "./ToolTipContainer";

export const AvniSwitch = ({ toolTipKey, switchFirst, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={{ paddingTop: 10, marginRight: "10px", marginLeft: "8px" }}>
      <Grid component="label" container alignItems="center" spacing={2}>
        {switchFirst && (
          <Grid>
            <Switch {...props} />
          </Grid>
        )}
        <Grid>{props.name}</Grid>
        {!switchFirst && (
          <Grid>
            <Switch {...props} />
          </Grid>
        )}
      </Grid>
    </ToolTipContainer>
  );
};
