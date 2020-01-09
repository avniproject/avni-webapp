import React, { Fragment } from "react";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid";
import ProgramDetails from "./subjectDashboardProgramDetails";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1)
  },
  tabView: {
    backgroundColor: "#f0e9e9",
    padding: theme.spacing(2)
  }
}));

let flagToCheckActivePrograms = true;

const SubjectDashboardProgramTab = ({ program }) => {
  const [activeValue, setActiveValue] = React.useState(0);
  const [exitedValue, setExitedValue] = React.useState(0);

  const handleChangeActive = (event, newValue) => {
    flagToCheckActivePrograms = true;
    setActiveValue(newValue);
  };

  const handleChangeExited = (event, newvalue) => {
    setExitedValue(newvalue);
    flagToCheckActivePrograms = false;
  };

  const classes = useStyles();

  return (
    <Fragment>
      <Paper className={classes.root}>
        <Grid className={classes.tabView} container spacing={1}>
          <Grid item xs={6}>
            <label>Active Programs</label>
            <AppBar position="static" color="default">
              <Tabs
                onChange={handleChangeActive}
                value={activeValue}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
              >
                {program && program.enrolments
                  ? program.enrolments.map((element, index) =>
                      element.programExitDateTime == null ? (
                        <Tab key={index} label={element.operationalProgramName} />
                      ) : (
                        ""
                      )
                    )
                  : ""}
              </Tabs>
            </AppBar>
          </Grid>
          <Grid item xs={2} />
          <Grid item xs={4}>
            <label>Exited Programs</label>
            <AppBar position="static" color="default">
              <Tabs
                value={exitedValue}
                onChange={handleChangeExited}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
              >
                {program && program.enrolments
                  ? program.enrolments.map((element, index) =>
                      element.programExitDateTime != null ? (
                        <Tab key={index} label={element.operationalProgramName} />
                      ) : (
                        ""
                      )
                    )
                  : ""}
              </Tabs>
            </AppBar>
          </Grid>
        </Grid>
        <ProgramDetails
          tabPanelValue={flagToCheckActivePrograms ? activeValue : exitedValue}
          programData={program}
        />
      </Paper>
    </Fragment>
  );
};

export default SubjectDashboardProgramTab;
