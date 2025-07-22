import PropTypes from "prop-types";
import { AppBar, Tabs, Tab, Typography, Box } from "@mui/material";
import GroupUsers from "./GroupUsers";
import GroupPrivileges from "./GroupPrivileges";
import GroupDashboards from "./GroupDashboards";
import { useState } from "react";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: 3
          }}
        >
          {children}
        </Box>
      )}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

export const TabView = ({ groupId, groupName, hasAllPrivileges, ...props }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div style={{ width: "100%" }}>
      <h5>{groupName}</h5>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#fff"
            }
          }}
        >
          <Tab
            label="Users"
            sx={{
              color: "#fff",
              "&.Mui-selected": {
                color: "#fff"
              }
            }}
          />
          <Tab
            label="Permissions"
            sx={{
              color: "#fff",
              "&.Mui-selected": {
                color: "#fff"
              }
            }}
          />
          <Tab
            label="Dashboards"
            sx={{
              color: "#fff",
              "&.Mui-selected": {
                color: "#fff"
              }
            }}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <GroupUsers groupId={groupId} {...props} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <GroupPrivileges groupId={groupId} groupName={groupName} hasAllPrivileges={hasAllPrivileges} {...props} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <GroupDashboards groupId={groupId} {...props} />
      </TabPanel>
    </div>
  );
};

export default TabView;
