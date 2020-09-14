import React from "react";
import { reportSideBarOptions } from "../Common";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import AggregateReport from "./AggregateReport";
import ActivityReport from "./ActivityReport";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  }
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <div>
          <Box>{children}</Box>
        </div>
      )}
    </div>
  );
}

const CannedReport = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  return (
    <ScreenWithAppBar
      appbarTitle={`Aggregate reports`}
      enableLeftMenuButton={true}
      sidebarOptions={reportSideBarOptions}
    >
      <div className={classes.root}>
        <AppBar position="static">
          <Tabs
            value={value}
            onChange={(event, newValue) => setValue(newValue)}
            aria-label="report-tabs"
            variant="fullWidth"
          >
            <Tab label="Activity Report" icon={<FormatListNumberedIcon />} />
            <Tab label="Aggregate Report" icon={<EqualizerIcon />} />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
          <ActivityReport />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <AggregateReport />
        </TabPanel>
      </div>
    </ScreenWithAppBar>
  );
};

export default CannedReport;
