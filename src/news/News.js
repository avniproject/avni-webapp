import React from "react";
import { Route, Switch, useRouteMatch, withRouter } from "react-router-dom";
import NewsList from "./NewsList";
import NewsDetails from "./NewsDetails";

function News() {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={path} component={NewsList} />
      <Route exact path={`${path}/:id/details`} component={NewsDetails} />
    </Switch>
  );
}

export default withRouter(News);
