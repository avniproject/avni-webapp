import { connect } from "react-redux";
import React from "react";
import Grid from "@material-ui/core/Grid";
import { withRouter } from "react-router-dom";
import { TabView } from "./components/TabbedView";

const UserGroupDetails = ({ ...props }) => {
  return (
    <Grid container>
      <TabView groupId={props.match.params.id} {...props} />
    </Grid>
  );
};

export default withRouter(connect()(UserGroupDetails));
