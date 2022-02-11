import { Grid, Typography } from "@material-ui/core";
import React from "react";

const MiddleText = ({ text, xs }) => {
  return (
    <Grid item container xs={xs || 1} justify={"center"}>
      <Typography variant={"subtitle1"}>{text}</Typography>
    </Grid>
  );
};

export default MiddleText;
