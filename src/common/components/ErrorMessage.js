import Typography from "@material-ui/core/Typography";
import React from "react";
import _ from "lodash";

export default function({ error, additionalStyle = {} }) {
  if (_.isNil(error)) return null;

  let message = error.message;
  if (error.response && error.response.data) message += " - " + error.response.data;
  console.error(message);
  return (
    <Typography variant={"h5"} style={{ color: "red", ...additionalStyle }}>
      Unexpected error occurred.
    </Typography>
  );
}
