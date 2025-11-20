import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { Grid } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { httpClient } from "../../common/utils/httpClient";
import { HomePageCard } from "./HomePageCard";
import WelcomeModal from "../../common/WelcomeModal";
import {
  SurroundSound,
  Assessment,
  AssignmentTurnedIn,
  Build,
  Collections,
  Description,
  Help,
  Keyboard,
  SupervisorAccount,
  Translate,
} from "@mui/icons-material";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import ApplicationContext from "../../ApplicationContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setChatOpen } from "../ducks";
import CurrentUserService from "../../common/service/CurrentUserService.ts";
import { isProduction } from "../../adminApp/OrganisationDetail";

const Homepage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.app.userInfo);
  const organisation = useSelector((state) => state.app.organisation);
  const isNewImplementation = useSelector(
    (state) => state.app.isNewImplementation,
  );
  const genericConfig = useSelector((state) => state.app.genericConfig);
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    const hasSeenWelcomeModal = localStorage.getItem("avni-welcome-modal-seen");
    return !hasSeenWelcomeModal;
  });

  httpClient.saveAuthTokenForAnalyticsApp();

  const showAnalytics = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.Analytics,
  );
  const showDataEntryApp = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.ViewEditEntitiesOnDataEntryApp,
  );

  const handleWelcomeOptionSelect = (option) => {
    switch (option) {
      case "templates":
        navigate("/appdesigner/templates");
        break;
      case "ai":
        dispatch(setChatOpen(true));
        break;
      case "appdesigner":
        navigate("/appdesigner/subjectType");
        break;
      default:
        break;
    }
  };

  return (
    <ScreenWithAppBar
      appbarTitle={`Avni Web Console - ${
        organisation.organisationCategoryName
      }`}
    >
      <Grid
        container
        sx={{
          justifyContent: "center",
        }}
      >
        <HomePageCard
          href={"/#/admin"}
          name={"Admin"}
          customIconComponent={
            <SupervisorAccount color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/appdesigner"}
          name={"Create App"}
          customIconComponent={
            <Build color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/documentation"}
          name={"Documentation"}
          customIconComponent={
            <Description color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/assignment"}
          name={"Assignment"}
          customIconComponent={
            <AssignmentTurnedIn color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/broadcast"}
          name={"Broadcast"}
          customIconComponent={
            <SurroundSound color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/translations"}
          name={"Translations"}
          customIconComponent={
            <Translate color="primary" style={{ fontSize: 100 }} />
          }
        />
        {showAnalytics && (
          <HomePageCard
            href={"/#/export"}
            name={"Reports"}
            customIconComponent={
              <Assessment color="primary" style={{ fontSize: 100 }} />
            }
          />
        )}
        {showDataEntryApp && (
          <HomePageCard
            href={"/#/app"}
            name={"Data Entry App"}
            customIconComponent={
              <Keyboard color="primary" style={{ fontSize: 100 }} />
            }
          />
        )}
        {showAnalytics && (
          <HomePageCard
            href={
              ApplicationContext.isDevEnv()
                ? `http://localhost:3000/avni-media?authToken=${httpClient.getAuthToken()}`
                : "/avni-media"
            }
            name={"Media Viewer "}
            customIconComponent={
              <Collections color="primary" style={{ fontSize: 100 }} />
            }
          />
        )}
        <HomePageCard
          href={"/#/help"}
          name={"Support And Training"}
          customIconComponent={
            <Help color="primary" style={{ fontSize: 100 }} />
          }
        />
      </Grid>
      {!CurrentUserService.isAdminAndImpersonating(userInfo) &&
        !isProduction(organisation) &&
        genericConfig.avniAi.showTemplates &&
        isNewImplementation && (
          <WelcomeModal
            open={showWelcomeModal}
            onClose={() => {
              setShowWelcomeModal(false);
              localStorage.setItem("avni-welcome-modal-seen", "true");
            }}
            onOptionSelect={handleWelcomeOptionSelect}
          />
        )}
    </ScreenWithAppBar>
  );
};

export default Homepage;
