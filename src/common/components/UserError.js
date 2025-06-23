import { Typography } from "@mui/material";
import React from "react";
import _ from "lodash";

export default function({ error }) {
  if (_.isNil(error)) return null;

  return (
    error && (
      <Typography variant="h5" sx={{ color: theme => theme.palette.error.main, mb: 2.5, ml: 2.5 }}>
        {error}
      </Typography>
    )
  );
}
