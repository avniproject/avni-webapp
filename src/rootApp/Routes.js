import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AccessDenied, WithProps } from "../common/components/utils";
import "./SecureApp.css";
import DataEntry from "../dataEntryApp/DataEntry";
import Homepage from "./views/Homepage";
import Translations from "../translations";
import Export from "../reports/export/Export";
import OrgManagerAppDesigner from "../adminApp/OrgManagerAppDesigner";
import Tutorials from "../tutorials/Tutorials";
import SelfServiceReports from "../reports/SelfServiceReports";
import DocumentationRoutes from "../documentation/DocumentationRoutes";
import Assignment from "../assignment/Assignment";
import SubjectAssignment from "../assignment/subjectAssignment/SubjectAssignment";
import TaskAssignment from "../assignment/taskAssignment/TaskAssignment";
import NewExport from "../reports/export/NewExport";
import Broadcast from "../news/Broadcast";
import AvniRouter from "../common/AvniRouter";
import CurrentUserService from "../common/service/CurrentUserService";
import OrgManager from "../adminApp/OrgManager";
import { useIdleTimer } from "react-idle-timer";
import { logout } from "./ducks";
import BaseAuthSession from "./security/BaseAuthSession";
import { Privilege } from "openchs-models";

const RestrictedRoute = ({ element, requiredPrivileges = [], userInfo }) => {
  return CurrentUserService.isAllowedToAccess(userInfo, requiredPrivileges) ? element : <AccessDenied />;
};

const AppRoutes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const organisation = useSelector(state => state.app.organisation);
  const user = useSelector(state => state.app.authSession);
  const userInfo = useSelector(state => state.app.userInfo);
  const genericConfig = useSelector(state => state.app.genericConfig);

  const handleOnIdle = () => {
    console.log("User is idle, was last active at ", getLastActiveTime());
    console.log("A user has logged in?", hasSignedIn());
    hasSignedIn() && dispatch(logout());
  };

  const hasSignedIn = () => {
    return user.authState === BaseAuthSession.AuthStates.SignedIn;
  };

  const { getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 60 * genericConfig.webAppTimeoutInMinutes,
    onIdle: handleOnIdle,
    debounce: 500,
    syncTimers: 200,
    crossTab: true,
    leaderElection: true
  });

  return (
    <Routes>
      <Route path="/admin" element={<RestrictedRoute userInfo={userInfo} element={WithProps({ navigate }, OrgManager)} />} />
      <Route
        path="/app"
        element={
          <RestrictedRoute
            requiredPrivileges={[Privilege.PrivilegeType.ViewEditEntitiesOnDataEntryApp]}
            userInfo={userInfo}
            element={<DataEntry />}
          />
        }
      />
      <Route path="/" element={<Navigate to={AvniRouter.getRedirectRouteFromRoot(userInfo)} replace />} />
      <Route
        path="/home"
        element={<RestrictedRoute requiredPrivileges={[]} userInfo={userInfo} element={WithProps({ user }, Homepage)} />}
      />
      <Route
        path="/appdesigner/*"
        element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation, navigate }, OrgManagerAppDesigner)} />}
      />
      <Route
        path="/documentation"
        element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation }, DocumentationRoutes)} />}
      />
      <Route path="/assignment" element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation }, Assignment)} />} />
      <Route
        path="/assignment/task"
        element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation }, TaskAssignment)} />}
      />
      <Route
        path="/assignment/subject"
        element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation }, SubjectAssignment)} />}
      />
      <Route
        path="/translations"
        element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation }, Translations)} />}
      />
      <Route path="/export" element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation }, Export)} />} />
      <Route path="/newExport" element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation }, NewExport)} />} />
      <Route
        path="/selfservicereports"
        element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation }, SelfServiceReports)} />}
      />
      <Route path="/help" element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation }, Tutorials)} />} />
      <Route path="/broadcast/*" element={<RestrictedRoute userInfo={userInfo} element={WithProps({ user, organisation }, Broadcast)} />} />
      <Route
        path="*"
        element={
          <div>
            <span>Page Not found</span>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
