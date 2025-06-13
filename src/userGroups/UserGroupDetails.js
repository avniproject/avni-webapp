import { connect } from "react-redux";
import React from "react";
import Grid from "@mui/material/Grid";
import { withRouter } from "react-router-dom";
import { TabView } from "./components/TabbedView";
import Box from "@mui/material/Box";
import { Title } from "react-admin";

const queryString = require("query-string");

const UserGroupDetails = ({ ...props }) => {
  let parsedProps = queryString.parse(props.location.search);
  let groupName = parsedProps.groupName;

  const [hasAllPrivileges, setHasAllPrivileges] = React.useState(parsedProps.hasAllPrivileges === "true");

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <Title title={"User Groups"} />
      <Grid container>
        <TabView
          groupId={props.match.params.id}
          groupName={groupName}
          hasAllPrivileges={hasAllPrivileges}
          setHasAllPrivileges={setHasAllPrivileges}
          {...props}
        />
      </Grid>
    </Box>
  );
};

export default withRouter(connect()(UserGroupDetails));
