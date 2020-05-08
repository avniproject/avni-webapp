import React from "react";
import { Documentation } from "./Documentation";
import { Grid } from "@material-ui/core";

export const DocumentationContainer = ({ filename, ...props }) => {
  return (
    <Grid container style={{ backgroundColor: "#fff" }}>
      <Grid item xs={9}>
        {props.children}
      </Grid>
      <Grid item xs={3}>
        <Documentation fileName={filename} />
      </Grid>
    </Grid>
  );
};
