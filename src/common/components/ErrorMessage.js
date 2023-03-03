import Typography from "@material-ui/core/Typography";
import React from "react";
import _ from "lodash";

export default function({ error }) {
  if (_.isNil(error)) return null;

  let message = error.message;
  if (error.response && error.response.data) message += " - " + error.response.data;
  return (
    <Typography variant={"h5"} style={{ color: "red" }}>
      {message}
    </Typography>
  );
}
