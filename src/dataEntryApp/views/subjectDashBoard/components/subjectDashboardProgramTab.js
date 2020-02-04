import React, { Fragment } from "react";
import { Paper } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid";
import ProgramDetails from "./subjectDashboardProgramDetails";

const AntTabs = withStyles({
  indicator: {
    display: "none"
  },
  root: {
    minHeight: "35px"
  }
})(Tabs);

const AntTab = withStyles(theme => ({
  root: {
    "&$selected": {
      backgroundColor: "#dae8fe",
      borderRight: "2px solid #1890ff",
      height: "36px"
    },
    color: "#2196f3",
    fontSize: "14px",
    minHeight: "35px",
    fontFamily: "Roboto Reg",
    borderRight: "2px solid #1890ff",
    textTransform: "none"
  },
  selected: {}
}))(props => <Tab disableRipple {...props} />);

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  programBar: {
    height: "100px",
    backgroundColor: "#f9f9f9"
  },
  activeProgramBar: {
    maxWidth: "600px",
    marginTop: "14px",
    marginLeft: "20px",
    height: "18px"
  },
  activeProgramLabel: {
    fontSize: "12px",
    fontFamily: "Roboto Reg",
    color: "#555555"
  },
  exitedProgramBar: {
    maxWidth: "372px",
    marginTop: "14px"
  },
  exitedProgramLabel: {
    fontSize: "12px",
    fontFamily: "Roboto Reg",
    color: "#555555"
  }
}));

let flagActive = false;
let flagExited = false;

const SubjectDashboardProgramTab = ({ program }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
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
                <Grid item className={classes.activeProgramBar}>
                  <label className={classes.activeProgramLabel}>Active Programs</label>

                  <AppBar style={{ minHeight: "35px" }} position="static" color="default">
                    <AntTabs
                      onChange={handleChange}
                      value={value}
                      indicatorColor="primary"
                      textColor="primary"
                      variant="scrollable"
                      scrollButtons="auto"
                      aria-label="scrollable auto tabs example"
                    >
                      {program && program.enrolments
                        ? program.enrolments.map((element, index) =>
                            element.programExitDateTime == null ? (
                              <AntTab
                                key={index}
                                value={index}
                                label={element.operationalProgramName}
                              />
                            ) : (
                              ""
                            )
                          )
                        : ""}
                    </AntTabs>
                  </AppBar>
                </Grid>
                <Grid item style={{ width: "60px" }} />
              </Fragment>
            ) : (
              ""
            )}

            {flagExited ? (
              <Grid item className={classes.exitedProgramBar}>
                <label className={classes.exitedProgramLabel}>Exited Programs</label>

                <AppBar position="static" color="default">
                  <AntTabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="scrollable auto tabs example"
                  >
                    {program && program.enrolments
                      ? program.enrolments.map((element, index) =>
                          element.programExitDateTime != null ? (
                            <AntTab
                              key={index}
                              value={index}
                              label={element.operationalProgramName}
                            />
                          ) : (
                            ""
                          )
                        )
                      : ""}
                  </AntTabs>
                </AppBar>
              </Grid>
            ) : (
              ""
            )}
          </Grid>
        </div>
        <ProgramDetails tabPanelValue={value} programData={program} />
      </Paper>
    </Fragment>
  );
};

export default SubjectDashboardProgramTab;
