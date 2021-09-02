import { Typography } from "@material-ui/core";
import React from "react";

export const Notice = ({ message }) => {
  return (
    <div style={{ backgroundColor: "#e1e5eb", padding: 10 }}>
      <Typography variant="h5" style={{ color: "red" }}>
        {message}
      </Typography>
    </div>
  );
};
