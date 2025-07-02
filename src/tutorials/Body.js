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
      <Grid>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Support resources
        </Typography>
      </Grid>
      <Grid>
        <Typography variant="body1" sx={{ color: theme => theme.palette.text.secondary }} sx={{ mb: 1 }}>
          Troubleshoot, ask us about the product, or submit a support ticket
        </Typography>
      </Grid>
    </Grid>
  );
};
export default Body;
