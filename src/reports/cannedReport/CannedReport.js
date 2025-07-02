import React from "react";
import { styled } from '@mui/material/styles';
import { reportSideBarOptions } from "../Common";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import AggregateReport from "./AggregateReport";
import ActivityReport from "./ActivityReport";
import { AppBar, Tabs, Tab, Box, Typography } from "@mui/material";
import { Equalizer, FormatListNumbered } from "@mui/icons-material";
import { some } from "lodash";

const StyledContainer = styled('div')(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.paper,
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && (
        <div>
          <Box>{children}</Box>
        </div>
      )}
    </div>
  );
}

function renderCannedReport(value, setValue) {
  return (
    <StyledContainer>
      <AppBar position="static">
        <Tabs value={value} onChange={(event, newValue) => setValue(newValue)} aria-label="report-tabs" variant="fullWidth">
          <Tab label="Activity Report" icon={<FormatListNumbered />} />
          <Tab label="Aggregate Report" icon={<Equalizer />} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <ActivityReport />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AggregateReport />
      </TabPanel>
    </StyledContainer>
  );
}

function renderComingSoon() {
  return (
    <Typography variant="h2" component="h2" sx={{ textAlign: "center" }}>
      Coming Soon!
    </Typography>
  );
}

const displayCannedReport = some(["localhost", "staging"], env => window.location.href.includes(env));

const CannedReport = () => {
  const [value, setValue] = React.useState(0);

  return (
    <ScreenWithAppBar appbarTitle={`Aggregate reports`} enableLeftMenuButton={true} sidebarOptions={reportSideBarOptions}>
      {displayCannedReport ? renderCannedReport(value, setValue) : renderComingSoon()}
    </ScreenWithAppBar>
  );
};

export default CannedReport;