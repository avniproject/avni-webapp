import React from "react";
import Paper from "@material-ui/core/Paper";
import { Grid, makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    padding: 20,
    marginBottom: 10
  }
}));

const SubjectVoided = ({ onUnVoid, showUnVoid }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Grid container direction={"column"} alignItems={"flex-start"}>
        <Grid item>
          <Typography variant="h4" gutterBottom color={"error"}>
            {"THE SUBJECT HAS BEEN VOIDED"}
          </Typography>
        </Grid>
        <Grid item>
          {showUnVoid && (
            <Button onClick={onUnVoid} color="primary">
              {"Unvoid"}
            </Button>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SubjectVoided;
