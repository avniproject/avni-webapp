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
  }
})(Tabs);

const AntTab = withStyles(theme => ({
  root: {
    "&$selected": {
      color: "#1890ff",
      backgroundColor: "#AED6F1",
      borderRight: "2px solid #1890ff"
    },

    borderRight: "2px solid #1890ff"
  },
  selected: {}
}))(props => <Tab disableRipple {...props} />);

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1)
  },
  tabView: {
    padding: theme.spacing(2)
  },
  padding: {
    padding: theme.spacing(3)
  }
}));

//let flagToCheckActivePrograms = true;
let flagActive = false;
let flagExited = false;

const SubjectDashboardProgramTab = ({ program }) => {
  // const [activeValue, setActiveValue] = React.useState(0);
  // const [exitedValue, setExitedValue] = React.useState(0);

  // const handleChangeActive = (event, newValue) => {
  //   flagToCheckActivePrograms = true;
  //   setActiveValue(newValue);
  // };

  // const handleChangeExited = (event, newvalue) => {
  //   setExitedValue(newvalue);
  //   flagToCheckActivePrograms = false;
  // };

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const classes = useStyles();

  if (program && program.enrolments) {
    program.enrolments.map((element, index) =>
      element.programExitDateTime == null ? (flagActive = true) : (flagExited = true)
    );
  }

  return (
    <Fragment>
      <Paper className={classes.root}>
        <Grid className={classes.tabView} container spacing={1}>
          {flagActive ? (
            <Fragment>
              <Grid item xs={6}>
                <label>Active Programs</label>

                <AppBar position="static" color="default">
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
              <Grid item xs={2} />
            </Fragment>
          ) : (
            ""
          )}

          {flagExited ? (
            <Grid item xs={4}>
              <label>Exited Programs</label>

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
        <ProgramDetails tabPanelValue={value} programData={program} />
      </Paper>
    </Fragment>
  );
};

export default SubjectDashboardProgramTab;
