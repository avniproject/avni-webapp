import React from 'react';
import {Route, Switch} from "react-router-dom";
import {Home, ManageUsers} from "../common";


const Routes = () =>
    <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/manage/users" component={ManageUsers}/>
    </Switch>;


export default Routes;
