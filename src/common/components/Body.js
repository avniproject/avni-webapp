import React from "react";
import { makeStyles } from "@mui/styles";
import { Paper } from "@mui/material";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2)
  }
}));

const Body = props => {
  const classes = useStyles();

  return (
    <Paper className={classes.root} {...props}>
      {props.children}
    </Paper>
  );
};

export default Body;
