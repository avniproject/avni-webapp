import React from "react";
import { includes, intersection, isEmpty } from "lodash";
import { Redirect, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { AccessDenied, WithProps } from "../common/components/utils";
import { OrgManager } from "../adminApp";
import { ROLES, withoutDataEntry } from "../common/constants";
import "./SecureApp.css";
import DataEntry from "../dataEntryApp/DataEntry";
import Homepage from "./views/Homepage";
import Forms from "../formDesigner/views/Forms";
import FormDetails from "../formDesigner/views/FormDetails";
import Concepts from "../formDesigner/views/Concepts";
import CreateEditConcept from "../formDesigner/views/CreateEditConcept";
import UploadImpl from "../formDesigner/views/UploadImpl";
import Translations from "../translations";

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
    <RestrictedRoute
      path="/app"
      allowedRoles={[ROLES.USER]}
      currentUserRoles={user.roles}
      component={DataEntry}
    />
    <RestrictedRoute
      exact
      path="/forms"
      allowedRoles={[ROLES.ORG_ADMIN]}
      currentUserRoles={user.roles}
      component={Forms}
    />
    <RestrictedRoute
      exact
      path="/forms/:formUUID"
      allowedRoles={[ROLES.ORG_ADMIN]}
      currentUserRoles={user.roles}
      component={FormDetails}
    />
    <RestrictedRoute
      exact
      path="/concepts"
      allowedRoles={[ROLES.ORG_ADMIN]}
      currentUserRoles={user.roles}
      component={Concepts}
    />
    <RestrictedRoute
      exact
      path="/concept/create"
      allowedRoles={[ROLES.ORG_ADMIN]}
      currentUserRoles={user.roles}
      component={() => <CreateEditConcept isCreatePage={true} />}
    />
    <RestrictedRoute
      exact
      path="/concept/:uuid/edit"
      allowedRoles={[ROLES.ORG_ADMIN]}
      currentUserRoles={user.roles}
      component={CreateEditConcept}
    />
    <RestrictedRoute
      exact
      path="/upload"
      allowedRoles={[ROLES.ORG_ADMIN]}
      currentUserRoles={user.roles}
      component={UploadImpl}
    />
    <RestrictedRoute
      exact
      path="/"
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
)(withoutDataEntry ? RoutesWithoutDataEntry : Routes);
