import React from 'react';
import { Route, Switch } from "react-router-dom";
import { Home, Main } from "../common/components";


const Routes = () =>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/adm" component={Main} />
    </Switch>;


export default Routes;
