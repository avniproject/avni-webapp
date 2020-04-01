import { connect } from "react-redux";
import React from "react";
import Grid from "@material-ui/core/Grid";
import { withRouter } from "react-router-dom";
import { TabView } from "./components/TabbedView";

const UserGroupDetails = ({ ...props }) => {
  console.log(props);
  return (
    <Grid container>
      <TabView
        groupId={props.match.params.id}
        groupName={props.match.params.groupName}
        {...props}
      />
    </Grid>
  );
};

export default withRouter(connect()(UserGroupDetails));
