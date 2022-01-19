import { Grid, Typography } from "@material-ui/core";
import React from "react";

const MiddleText = ({ text }) => {
  return (
    <Grid item>
      <Typography variant={"subtitle1"} style={{ marginRight: 10, marginLeft: 10 }}>
        {text}
      </Typography>
    </Grid>
  );
};

export default MiddleText;
