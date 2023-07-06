import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { AccessDenied, WithProps } from "../common/components/utils";
import { OrgManager } from "../adminApp";
import "./SecureApp.css";
import DataEntry from "../dataEntryApp/DataEntry";
import Homepage from "./views/Homepage";
import Translations from "../translations";
import Export from "../reports/export/Export";
import OrgManagerAppDesigner from "../adminApp/OrgManagerAppDesigner";
import Tutorials from "../tutorials/Tutorials";
import SelfServiceReports from "../reports/SelfServiceReports";
import CannedReport from "../reports/cannedReport/CannedReport";
import Documentation from "../documentation/Documentation";
import Assignment from "../assignment/Assignment";
import SubjectAssignment from "../assignment/subjectAssignment/SubjectAssignment";
import TaskAssignment from "../assignment/taskAssignment/TaskAssignment";
import NewExport from "../reports/export/NewExport";
import Broadcast from "../news/Broadcast";
import User from "../common/model/User";
import AvniRouter from "../common/AvniRouter";
import DeploymentManager from "../adminApp/DeploymentManager";

const RestrictedRoute = ({ component: C, requiredPrivileges = [], userInfo, ...rest }) => (
  <Route
    {...rest}
    render={routerProps =>
      User.isAllowedToAccess(userInfo, requiredPrivileges) ? (
        <C {...routerProps} />
      ) : (
        <AccessDenied />
      )
    }
  />
);

const AdminRoute = ({ component: C, userInfo, ...rest }) => (
  <Route
    {...rest}
    render={routerProps => (userInfo.isAdmin ? <C {...routerProps} /> : <AccessDenied />)}
  />
);

const Routes = ({ user, userInfo, organisation }) => (
  <Switch>
    <AdminRoute
      exact
      path="/deploymentAdmin/"
      userInfo={userInfo}
      requiredPrivileges={[]}
      component={OrgManager}
    />
    <AdminRoute path="/deploymentAdmin/*" userInfo={userInfo} component={DeploymentManager} />
    <Route path="/admin">
      <AdminRoute path="/" userInfo={userInfo} component={DeploymentManager} />
    </Route>
    <RestrictedRoute
      path="/app"
      userInfo={userInfo}
      requiredPrivileges={[]}
      component={DataEntry}
    />
    <Route exact path="/">
      <Redirect to={AvniRouter.getRouteFromRoot(userInfo)} />
    </Route>
    <RestrictedRoute
      exact
      path="/home"
      userInfo={userInfo}
      requiredPrivileges={[]}
      component={WithProps({ user }, Homepage)}
    />
    <Route path="/appdesigner">
      <RestrictedRoute
        path="/"
        userInfo={userInfo}
        component={WithProps({ user, organisation }, OrgManagerAppDesigner)}
      />
    </Route>
    <RestrictedRoute
      exact
      path="/documentation"
      user={userInfo}
      component={WithProps({ user, organisation }, Documentation)}
    />
    <RestrictedRoute
      exact
      path="/assignment"
      userInfo={userInfo}
      component={WithProps({ user, organisation }, Assignment)}
    />
    <RestrictedRoute
      exact
      path="/assignment/task"
      userInfo={userInfo}
      component={WithProps({ user, organisation }, TaskAssignment)}
    />
    <RestrictedRoute
      exact
      path="/assignment/subject"
      userInfo={userInfo}
      component={WithProps({ user, organisation }, SubjectAssignment)}
    />
    <RestrictedRoute
      exact
      path="/translations"
      userInfo={userInfo}
      component={WithProps({ user, organisation }, Translations)}
    />
    <RestrictedRoute
      exact
      path="/export"
      userInfo={userInfo}
      component={WithProps({ user, organisation }, Export)}
    />
    <RestrictedRoute
      exact
      path="/newExport"
      userInfo={userInfo}
      component={WithProps({ user, organisation }, NewExport)}
    />
    <RestrictedRoute
      exact
      path="/selfservicereports"
      userInfo={userInfo}
      component={WithProps({ user, organisation }, SelfServiceReports)}
    />
    <RestrictedRoute
      exact
      path="/cannedreports"
      userInfo={userInfo}
      component={WithProps({ user, organisation }, CannedReport)}
    />
    <RestrictedRoute
      exact
      path="/help"
      userInfo={userInfo}
      component={WithProps({ user, organisation }, Tutorials)}
    />
    <RestrictedRoute
      path="/broadcast"
      userInfo={userInfo}
      component={WithProps({ user, organisation }, Broadcast)}
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

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.authSession,
  userInfo: state.app.userInfo
});

export default connect(
  mapStateToProps,
  null
)(Routes);
