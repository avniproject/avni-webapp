import Button from "@material-ui/core/Button";
import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(1),
    paddingLeft: 0,
    marginBottom: theme.spacing(1)
  }
}));

const IconButton = ({ onClick, Icon, label, disabled }) => {
  const classes = useStyles();
  return (
    <Button
      color="primary"
      size="small"
      className={classes.root}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon style={{ marginRight: 8 }} /> {label}
    </Button>
  );
};

export default IconButton;
