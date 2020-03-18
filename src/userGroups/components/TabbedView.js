import React from "react";
import Tabs from "@material-ui/core/Tab";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";

export const TabbedView = ({ name, value }) => {
  const handleChange = () => {};
  return (
    <Paper square>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="disabled tabs example"
      >
        <Tab label="Active" />
        <Tab label="Disabled" disabled />
        <Tab label="Active" />
      </Tabs>
    </Paper>
  );
};
