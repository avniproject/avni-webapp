import React from "react";
import { PlatformDocumentation } from "./PlatformDocumentation";
import { Grid } from "@material-ui/core";

export const DocumentationContainer = ({ filename, ...props }) => {
  return (
    <Grid container style={{ backgroundColor: "#fff" }}>
      <Grid item xs={9}>
        {props.children}
      </Grid>
      {filename && (
        <Grid item xs={3}>
          <PlatformDocumentation fileName={filename} />
        </Grid>
      )}
    </Grid>
  );
};
