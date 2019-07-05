import React from 'react';
import {includes, intersection, isEmpty} from 'lodash';
import {Route, Redirect, Switch, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {AccessDenied} from "../common/components";
import {OrgManager} from "../orgManager";
import {DataEntry} from "../dataEntry";
import {ROLES} from "../common/constants";
import './SecureApp.css';

const RestrictedRoute = ({component: C, allowedRoles, currentUserRoles, ...rest}) =>
    <Route {...rest} render={routerProps =>
        isEmpty(allowedRoles) || !isEmpty(intersection(allowedRoles, currentUserRoles)) ?
            <C {...routerProps} />
            : <AccessDenied/>
    }/>;


const Routes = (props) =>
    <Switch>
        <RestrictedRoute exact path="/admin"
                         allowedRoles={[ROLES.ORG_ADMIN,]}
                         currentUserRoles={props.userRoles}
                         component={OrgManager}/>
        <RestrictedRoute path="/app/:page"
                         allowedRoles={[ROLES.USER,]}
                         currentUserRoles={props.userRoles}
                         component={DataEntry}/>
        <Route exact path="/app">
            <Redirect to="/app/search"/>
        </Route>
        <Route exact path="/">
            <Redirect to={includes(props.userRoles, ROLES.ORG_ADMIN) ? "/admin" : "/app"}/>
        </Route>
    </Switch>;


const mapStateToProps = state => ({
    userRoles: state.app.user.roles
});


export default withRouter(
    connect(mapStateToProps, null)(Routes)
);