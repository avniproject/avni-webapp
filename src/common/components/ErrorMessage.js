import Typography from "@material-ui/core/Typography";
import React from "react";

export default function({ error }) {
  let message = error.message;
  if (error.response && error.response.data) message += " - " + error.response.data;
  return (
    <Typography variant={"h5"} style={{ color: "red" }}>
      {message}
    </Typography>
  );
}
