import React, { Fragment } from "react";
import { Paper } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import ProgramView from "./subjectDashboardProgramView";

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

function TabPanel(props) {
  const { children, value, index } = props;

  return <Typography>{value == index && <Box p={3}>{children}</Box>}</Typography>;
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

let flagActive = true;

const SubjectDashboardProgramTab = ({ program }) => {
  const [value, setValue] = React.useState(0);
  const [value1, setValue1] = React.useState(0);

  const handleChangeActive = (event, newValue) => {
    flagActive = true;
    setValue(newValue);
  };

  const handleChangeExited = (event, newvalue) => {
    setValue1(newvalue);
    flagActive = false;
  };

  const classes = useStyles();

  return (
    <Fragment>
      <Paper className={classes.root}>
        <Grid className={classes.tabView} container spacing={1}>
          <Grid xs={6}>
            <label>Active Programs</label>
            <AppBar position="static" color="default">
              <Tabs
                onChange={handleChangeActive}
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
                        <Tab label={element.operationalProgramName} />
                      ) : (
                        ""
                      )
                    )
                  : ""}
              </Tabs>
            </AppBar>
          </Grid>

          <Grid xs={2} />
          <Grid xs={4}>
            <label>Exited Programs</label>
            <AppBar position="static" color="default">
              <Tabs
                value={value1}
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
                        <Tab label={element.operationalProgramName} />
                      ) : (
                        ""
                      )
                    )
                  : ""}
              </Tabs>
            </AppBar>
          </Grid>
        </Grid>
        {flagActive && program && program.enrolments
          ? program.enrolments.map((element, index) => (
              <Fragment>
                <TabPanel value={value} index={index}>
                  <ProgramView programData={element} />
                </TabPanel>
              </Fragment>
            ))
          : ""}
        {!flagActive && program && program.enrolments
          ? program.enrolments.map((element, index) => (
              <Fragment>
                <TabPanel value={value1} index={index}>
                  <ProgramView programData={element} />
                </TabPanel>
              </Fragment>
            ))
          : ""}
      </Paper>
    </Fragment>
  );
};

export default SubjectDashboardProgramTab;
