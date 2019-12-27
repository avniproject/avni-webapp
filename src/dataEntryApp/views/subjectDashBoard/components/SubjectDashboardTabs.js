import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MUAppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import SubjectDashboardProfileTab from "./SubjectDashboardProfileTab";
import SubjectDashboardGeneralTab from "./subjectDashboardGeneralTab";
import SubjectDashboardProgramTab from "./subjectDashboardProgramTab";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles(theme => ({
  tabsDisplay: {
    margin: theme.spacing(1)
  },
  tabView: {
    backgroundColor: "white",
    boxShadow: "none"
  }
}));

function TabContent(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabContent.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

export default ({ profile, general, program }) => {
  const classes = useStyles();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `scrollable-auto-tab-${index}`,
      "aria-controls": `scrollable-auto-tabpanel-${index}`
    };
  }

  return (
    <Fragment>
      <MUAppBar className={classes.tabView} position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tab label="PROGRAMS" {...a11yProps(0)} />
          <Tab label="PROFILE" {...a11yProps(1)} />
          <Tab label="GENERAL" {...a11yProps(2)} />
        </Tabs>
      </MUAppBar>
      <TabContent value={value} index={0}>
        <Paper className={classes.tabsDisplay}>
          <SubjectDashboardProgramTab program={program} />
        </Paper>
      </TabContent>
      <TabContent value={value} index={1}>
        <Paper className={classes.tabsDisplay}>
          <SubjectDashboardProfileTab profile={profile} />
        </Paper>
      </TabContent>
      <TabContent value={value} index={2}>
        <Paper className={classes.tabsDisplay}>
          <SubjectDashboardGeneralTab general={general} />
        </Paper>
      </TabContent>
    </Fragment>
  );
};
