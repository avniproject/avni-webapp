import { connect } from "react-redux";
import React from "react";
import Grid from "@material-ui/core/Grid";
import { withRouter } from "react-router-dom";
import { TabView } from "./components/TabbedView";
const queryString = require("query-string");

const UserGroupDetails = ({ ...props }) => {
  let parsedProps = queryString.parse(props.location.search);
  let groupName = parsedProps.groupName;

  const [hasAllPrivileges, setHasAllPrivileges] = React.useState(
    parsedProps.hasAllPrivileges === "true"
  );

  return (
    <Grid container>
      <TabView
        groupId={props.match.params.id}
        groupName={groupName}
        hasAllPrivileges={hasAllPrivileges}
        setHasAllPrivileges={setHasAllPrivileges}
        {...props}
      />
    </Grid>
  );
};

export default withRouter(connect()(UserGroupDetails));
