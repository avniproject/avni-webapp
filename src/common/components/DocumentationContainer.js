import React from "react";
import { Documentation } from "./Documentation";
import { Grid } from "@material-ui/core";

export const DocumentationContainer = props => {
  return (
    <Grid container>
      <Grid item xs={9}>
        {props.children}
      </Grid>
      <Grid item xs={3}>
        <Documentation />
      </Grid>
    </Grid>
  );
};
