import { Typography } from "@mui/material";
import React from "react";
import _ from "lodash";

export default function({ error }) {
  if (_.isNil(error)) return null;

  return (
    error && (
      <Typography variant={"h5"} style={{ color: "red", marginBottom: 20, marginLeft: 20 }}>
        {error}
      </Typography>
    )
  );
}
