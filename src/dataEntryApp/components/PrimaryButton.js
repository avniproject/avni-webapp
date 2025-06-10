import { Button } from "@mui/material";
import React from "react";

export default ({ children, ...props }) => (
  <Button variant="contained" size="small" color="primary" {...props}>
    {children}
  </Button>
);
