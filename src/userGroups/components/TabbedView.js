import React from "react";
import PropTypes from "prop-types";
import { AppBar, Tabs, Tab, Typography, Box } from "@mui/material";
import GroupUsers from "./GroupUsers";
import GroupPrivileges from "./GroupPrivileges";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import GroupDashboards from "./GroupDashboards";

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
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

export const TabView = ({ groupId, groupName, hasAllPrivileges, userList, ...props }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <div style={{ width: "100%" }}>
      <h5>{groupName}</h5>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Users" />
          <Tab label="Permissions" />
          <Tab label="Dashboards" />
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

const mapStateToProps = state => ({});

export default withRouter(
  connect(
    mapStateToProps
    //    mapDispatchToProps,
  )(TabView)
);
