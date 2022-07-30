import React from "react";
import { Route, Switch, useRouteMatch, withRouter } from "react-router-dom";
import TaskAssignment from "./taskAssignment/TaskAssignment";

function Assignment() {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={path} component={TaskAssignment} />
    </Switch>
  );
}

export default withRouter(Assignment);
