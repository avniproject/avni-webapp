import { Grid, Switch } from "@mui/material";

import { ToolTipContainer } from "./ToolTipContainer";

export const AvniSwitch = ({ toolTipKey, switchFirst, ...props }) => {
  return (
    <ToolTipContainer toolTipKey={toolTipKey} styles={{ paddingTop: 10, marginRight: "10px", marginLeft: "8px" }}>
      <Grid
        component="label"
        container
        spacing={2}
        sx={{
          alignItems: "center"
        }}
      >
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
