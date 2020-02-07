import React, { Fragment } from "react";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import ProgramDetails from "./subjectDashboardProgramDetails";
import Program from "./Program";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  programBar: {
    height: "100px",
    backgroundColor: "#f9f9f9"
  }
}));

let flagActive = false;
let flagExited = false;

const SubjectDashboardProgramTab = ({ program }) => {
  const [selectedTab, setValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    console.log("handle tab change", newValue);
    setValue(newValue);
  };

  if (program && program.enrolments) {
    program.enrolments.sort(function(left, right) {
      return left.hasOwnProperty("programExitDateTime")
        ? 1
        : right.hasOwnProperty("programExitDateTime")
        ? -1
        : 0;
    });
  }

  const classes = useStyles();

  if (program && program.enrolments) {
    program.enrolments.map((element, index) =>
      element.programExitDateTime == null ? (flagActive = true) : (flagExited = true)
    );
  }

  return (
    <Fragment>
      <Paper className={classes.root}>
        <div className={classes.programBar}>
          <Grid container spacing={1}>
            {flagActive ? (
              <Fragment>
                <Program
                  type="active"
                  program={program}
                  selectedTab={selectedTab}
                  handleTabChange={handleTabChange}
                />
                <Grid item style={{ width: "60px" }} />
              </Fragment>
            ) : (
              ""
            )}

            {flagExited ? (
              <Program
                type="exited"
                program={program}
                selectedTab={selectedTab}
                handleTabChange={handleTabChange}
              />
            ) : (
              ""
            )}
          </Grid>
        </div>
        <ProgramDetails tabPanelValue={selectedTab} programData={program} />
      </Paper>
    </Fragment>
  );
};

export default SubjectDashboardProgramTab;
