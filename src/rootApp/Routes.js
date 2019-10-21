import React from "react";
import { includes, intersection, isEmpty } from "lodash";
import { Redirect, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { AccessDenied } from "../common/components/utils";
import { OrgManager } from "../adminApp";
import { ROLES } from "../common/constants";
import "./SecureApp.css";
// import DataEntry from "../dataEntryApp/DataEntry";

const RestrictedRoute = ({ component: C, allowedRoles, currentUserRoles, ...rest }) => (
  <Route
    {...rest}
    render={routerProps =>
      isEmpty(allowedRoles) || !isEmpty(intersection(allowedRoles, currentUserRoles)) ? (
        <C {...routerProps} />
      ) : (
        <AccessDenied />
      )
    }
  />
);

const Routes = ({ user, organisation }) => (
  <Switch>
    <Route path="/admin">
      <RestrictedRoute
        path="/"
        allowedRoles={[ROLES.ORG_ADMIN]}
        currentUserRoles={user.roles}
        component={OrgManager}
      />
    </Route>
    {/*<RestrictedRoute*/}
    {/*path="/app"*/}
    {/*allowedRoles={[ROLES.USER]}*/}
    {/*currentUserRoles={user.roles}*/}
    {/*component={DataEntry}*/}
    {/*/>*/}
    <Route exact path="/">
      <Redirect to={includes(user.roles, ROLES.ORG_ADMIN) ? "/admin" : "/app"} />
    </Route>
    <Route
      component={() => (
        <div>
          <span>Page Not found</span>
        </div>
      )}
    />
  </Switch>
);

const RoutesWithoutDataEntry = ({ user }) => (
  <Switch>
    <Route path="/admin">
      <RestrictedRoute
        path="/"
        allowedRoles={[ROLES.ORG_ADMIN]}
        currentUserRoles={user.roles}
        component={OrgManager}
      />
    </Route>
    <Route exact path="/">
      <Redirect to="/admin" />
    </Route>
  </Switch>
);

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.user
});

export default connect(
  mapStateToProps,
  null
)(false ? RoutesWithoutDataEntry : Routes);
