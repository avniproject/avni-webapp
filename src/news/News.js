import React from "react";
import { Route, Switch, useRouteMatch, withRouter } from "react-router-dom";
import NewsList from "./NewsList";

function News() {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${path}`} component={NewsList} />
      <Route exact path={`${path}/:id/details`} component={() => <div>details page</div>} />
      <Route exact path={`${path}/create`} component={() => <div>create page</div>} />
    </Switch>
  );
}

export default withRouter(News);
