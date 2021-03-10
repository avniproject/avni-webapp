import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

export const ActionButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText("#008b8a"),
    backgroundColor: "#008b8a",
    "&:hover": {
      backgroundColor: "#008b8a"
    }
  }
}))(Button);
