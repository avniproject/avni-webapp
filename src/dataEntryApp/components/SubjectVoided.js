import React from "react";
import { makeStyles } from "@mui/styles";
import { Paper, GridLegacy as Grid, Button, Typography } from "@mui/material";

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
      <Grid
        container
        direction={"column"}
        sx={{
          alignItems: "flex-start"
        }}
      >
        <Grid item>
          <Typography variant="h4" sx={{ color: theme => theme.palette.error.main, mb: 1 }}>
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
