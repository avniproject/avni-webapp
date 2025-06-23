import { Grid, Typography } from "@mui/material";
import React from "react";

const Body = () => {
  return (
    <Grid
      container
      direction={"column"}
      sx={{
        alignItems: "center"
      }}
    >
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
