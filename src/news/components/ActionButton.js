import { Button } from "@mui/material";
import { withStyles } from "@mui/styles";

export const ActionButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText("#008b8a"),
    backgroundColor: "#008b8a",
    "&:hover": {
      backgroundColor: "#008b8a"
    }
  }
}))(Button);
