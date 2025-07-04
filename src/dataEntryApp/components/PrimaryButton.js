import { Button } from "@mui/material";

export default ({ children, ...props }) => (
  <Button variant="contained" size="small" color="primary" {...props}>
    {children}
  </Button>
);
