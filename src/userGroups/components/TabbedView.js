import React from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import GroupUsers from "./GroupUsers";
import GroupPrivileges from "./GroupPrivileges";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

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
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <GroupUsers groupId={groupId} {...props} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <GroupPrivileges
          groupId={groupId}
          groupName={groupName}
          hasAllPrivileges={hasAllPrivileges}
          {...props}
        />
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
