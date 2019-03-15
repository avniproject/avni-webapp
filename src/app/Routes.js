import React from 'react';
import { Route, Switch } from "react-router-dom";
import { Home } from "../common/components";
import { OrgManager } from "../orgManager";

const Routes = () =>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/org" component={OrgManager} />
    </Switch>;


export default Routes;
