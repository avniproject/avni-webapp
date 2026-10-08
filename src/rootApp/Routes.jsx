import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AccessDenied } from "../common/components/utils";
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
import { usePostHog } from "posthog-js/react";
import _ from "lodash";

const RestrictedRoute = ({ element, requiredPrivileges = [], userInfo }) => {
  return CurrentUserService.isAllowedToAccess(userInfo, requiredPrivileges) ? (
    element
  ) : (
    <AccessDenied />
  );
};

const AppRoutes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const organisation = useSelector((state) => state.app?.organisation);
  const user = useSelector((state) => state.app?.authSession);
  const userInfo = useSelector((state) => state.app?.userInfo);
  const genericConfig = useSelector(
    (state) => state.app?.genericConfig || { webAppTimeoutInMinutes: 30 },
  );

  const posthog = usePostHog();

  if (
    _.get(userInfo, "organisationCategoryName") === "Trial" &&
    !userInfo.isAdmin
  ) {
    if (!_.isNil(userInfo.username) && !posthog._isIdentified()) {
      posthog.identify(userInfo.username, {
        organisationCategory: userInfo.organisationCategoryName,
        isAdmin: userInfo.isAdmin,
        organisationName: userInfo.organisationName,
        organisationId: userInfo.organisationId,
      });
      posthog.startSessionRecording();
    }
  } else {
    if (!posthog.has_opted_out_capturing()) {
      posthog.opt_out_capturing();
    }
  }
  const handleOnIdle = () => {
    console.log("User is idle, was last active at ", getLastActiveTime());
    console.log("A user has logged in?", hasSignedIn());
    hasSignedIn() && dispatch(logout());
  };
  const hasSignedIn = () => {
    return user?.authState === BaseAuthSession.AuthStates.SignedIn;
  };

  const { getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 60 * genericConfig.webAppTimeoutInMinutes,
    onIdle: handleOnIdle,
    debounce: 500,
    syncTimers: 200,
    crossTab: true,
    leaderElection: true,
  });

  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={<OrgManager navigate={navigate} />}
          />
        }
      />
      <Route
        path="/app/*"
        element={
          <RestrictedRoute
            requiredPrivileges={[
              Privilege.PrivilegeType.ViewEditEntitiesOnDataEntryApp,
            ]}
            userInfo={userInfo}
            element={<DataEntry />}
          />
        }
      />
      <Route
        path="/"
        element={
          <Navigate
            to={
              userInfo ? AvniRouter.getRedirectRouteFromRoot(userInfo) : "/home"
            }
            replace
          />
        }
      />
      <Route
        path="/home"
        element={
          <RestrictedRoute
            requiredPrivileges={[]}
            userInfo={userInfo}
            element={<Homepage user={user} />}
          />
        }
      />
      <Route
        path="/appdesigner/*"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={
              <OrgManagerAppDesigner
                user={user}
                organisation={organisation}
                userInfo={userInfo}
                navigate={navigate}
              />
            }
          />
        }
      />
      <Route
        path="/documentation/*"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={
              <DocumentationRoutes user={user} organisation={organisation} />
            }
          />
        }
      />
      <Route
        path="/assignment"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={<Assignment user={user} organisation={organisation} />}
          />
        }
      />
      <Route
        path="/taskAssignment"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={<TaskAssignment user={user} organisation={organisation} />}
          />
        }
      />
      <Route
        path="/subjectAssignment"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={
              <SubjectAssignment user={user} organisation={organisation} />
            }
          />
        }
      />
      <Route
        path="/translations"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={<Translations user={user} organisation={organisation} />}
          />
        }
      />
      <Route
        path="/export"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={<Export user={user} organisation={organisation} />}
          />
        }
      />
      <Route
        path="/newExport"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={<NewExport user={user} organisation={organisation} />}
          />
        }
      />
      <Route
        path="/selfservicereports"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={
              <SelfServiceReports user={user} organisation={organisation} />
            }
          />
        }
      />
      <Route
        path="/help"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={<Tutorials user={user} organisation={organisation} />}
          />
        }
      />
      <Route
        path="/broadcast/*"
        element={
          <RestrictedRoute
            userInfo={userInfo}
            element={<Broadcast user={user} organisation={organisation} />}
          />
        }
      />
      <Route
        path="*"
        element={
          <RestrictedRoute
            requiredPrivileges={[]}
            userInfo={userInfo}
            element={<div>The requested page is not available.</div>}
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
