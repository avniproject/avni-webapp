import { Grid, Typography } from "@mui/material";
import React from "react";

const Body = () => {
  return (
    <Grid container alignItems={"center"} direction={"column"}>
      <Grid item>
        <Typography variant="h4" gutterBottom>
          Support resources
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Troubleshoot, ask us about the product, or submit a support ticket
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Body;
