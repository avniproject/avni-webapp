import React from 'react';
import {Route, Switch} from "react-router-dom";
import {Home, UserManager} from "../common/components";


const Routes = () =>
    <Switch>
      <Route exact path="/" component={Home}/>
      <Route path="/manage-users" component={UserManager}/>
    </Switch>;


export default Routes;
