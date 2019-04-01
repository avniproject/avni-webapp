import React from 'react';
import { intersection, isEmpty } from 'lodash';
import { Route, Switch, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { AccessDenied } from "../common/components";
import { OrgManager } from "../orgManager";
import { ROLES } from "../common/constants";
import './SecureApp.css';

const RestrictedRoute = ({ component: C, allowedRoles, currentUserRoles, ...rest }) =>
    <Route {...rest} render={ routerProps =>
        isEmpty(allowedRoles) || !isEmpty(intersection(allowedRoles, currentUserRoles)) ?
            <C {...routerProps} />
            : <AccessDenied/>
    }/>;


const Routes = (props) =>
    <Switch>
      <RestrictedRoute exact path="/"
                       allowedRoles={[ROLES.ORG_ADMIN,]}
                       currentUserRoles={props.userRoles}
                       component={OrgManager} />
    </Switch>;


const mapStateToProps = state => ({
    userRoles: state.app.user.roles
});


export default withRouter(
    connect(mapStateToProps, null)(Routes)
);