import React from "react";
import { makeStyles } from "@mui/styles";
import { Paper, Grid, Button, Typography } from "@mui/material";

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
