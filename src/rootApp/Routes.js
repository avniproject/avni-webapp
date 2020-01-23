import React from "react";
import { includes, intersection, isEmpty } from "lodash";
import { Redirect, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { AccessDenied, WithProps } from "../common/components/utils";
import { OrgManager, SuperAdmin } from "../adminApp";
import { ROLES, withoutDataEntry } from "../common/constants";
import "./SecureApp.css";
import DataEntry from "../dataEntryApp/DataEntry";
import Homepage from "./views/Homepage";
import Translations from "../translations";
import Export from "../reports/Export";

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
        allowedRoles={includes(user.roles, ROLES.ADMIN) ? [ROLES.ADMIN] : [ROLES.ORG_ADMIN]}
        currentUserRoles={user.roles}
        component={includes(user.roles, ROLES.ADMIN) ? SuperAdmin : OrgManager}
      />
    </Route>
    <RestrictedRoute
      path="/app"
      allowedRoles={[ROLES.USER]}
      currentUserRoles={user.roles}
      component={DataEntry}
    />
    <Route exact path="/">
      <Redirect
        to={
          includes(user.roles, ROLES.ADMIN)
            ? "/admin"
            : includes(user.roles, ROLES.ORG_ADMIN)
            ? "/home"
            : "/app"
        }
      />
    </Route>
    <RestrictedRoute
      exact
      path="/home"
      allowedRoles={[ROLES.ORG_ADMIN]}
      currentUserRoles={user.roles}
      component={Homepage}
    />
    <RestrictedRoute
      exact
      path="/translations"
      allowedRoles={[ROLES.ORG_ADMIN]}
      currentUserRoles={user.roles}
      component={WithProps({ user, organisation }, Translations)}
    />
    <RestrictedRoute
      exact
      path="/export"
      allowedRoles={[ROLES.ORG_ADMIN]}
      currentUserRoles={user.roles}
      component={WithProps({ user, organisation }, Export)}
    />
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
        allowedRoles={includes(user.roles, ROLES.ADMIN) ? [ROLES.ADMIN] : [ROLES.ORG_ADMIN]}
        currentUserRoles={user.roles}
        component={includes(user.roles, ROLES.ADMIN) ? SuperAdmin : OrgManager}
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
)(withoutDataEntry ? RoutesWithoutDataEntry : Routes);
