import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import {
  Grid,
  Box,
  LinearProgress,
  Typography,
  IconButton,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { httpClient } from "../../common/utils/httpClient";
import { HomePageCard } from "./HomePageCard";
import WelcomeModal from "../../common/WelcomeModal";
import {
  SurroundSound,
  Assessment,
  AssignmentTurnedIn,
  Build,
  Close,
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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setChatOpen } from "../ducks";
import CurrentUserService from "../../common/service/CurrentUserService.ts";
import { showTemplatesCheck } from "../../adminApp/OrgManagerAppDesigner";
import {
  isTerminalStatus,
  TEMPLATE_APPLY_PROGRESS_KEY,
} from "../../formDesigner/components/TemplateOrganisations/ApplyTemplateDialog";

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
  const [showProgressBar, setShowProgressBar] = useState(false);

  httpClient.saveAuthTokenForAnalyticsApp();

  useEffect(() => {
    const isTemplateApplyInProgress = localStorage.getItem(
      TEMPLATE_APPLY_PROGRESS_KEY,
    );

    if (!isTemplateApplyInProgress) {
      setShowProgressBar(false);
      return;
    }

    let intervalId;

    const pollJobStatus = () => {
      httpClient
        .get("/web/templateOrganisations/apply/status")
        .then((response) => {
          const { applyTemplateJob } = response.data;
          if (applyTemplateJob) {
            const shouldShowProgress = applyTemplateJob.status !== "NOT_FOUND";
            setShowProgressBar(shouldShowProgress);

            if (isTerminalStatus(applyTemplateJob.status)) {
              clearInterval(intervalId);
              setShowProgressBar(false);
              localStorage.removeItem(TEMPLATE_APPLY_PROGRESS_KEY);
            }
          } else {
            setShowProgressBar(false);
            localStorage.removeItem(TEMPLATE_APPLY_PROGRESS_KEY);
            clearInterval(intervalId);
          }
        })
        .catch((error) => {
          setShowProgressBar(false);
          localStorage.removeItem(TEMPLATE_APPLY_PROGRESS_KEY);
          clearInterval(intervalId);
        });
    };

    pollJobStatus();
    intervalId = setInterval(pollJobStatus, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleCloseProgressBar = () => {
    setShowProgressBar(false);
    localStorage.removeItem(TEMPLATE_APPLY_PROGRESS_KEY);
  };

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
      {(() => {
        return (
          showProgressBar && (
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1000,
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid #e0e0e0",
                padding: "0.5rem 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                APPLYING TEMPLATE
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  marginLeft: "auto",
                }}
              >
                <Box sx={{ width: "18.75rem" }}>
                  <LinearProgress
                    variant="indeterminate"
                    sx={{
                      height: "0.5rem",
                      borderRadius: "0.25rem",
                      backgroundColor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#2196f3",
                        borderRadius: "0.25rem",
                      },
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ minWidth: "1.875rem", color: "#666" }}
                />
              </Box>
            </Box>
          )
        );
      })()}
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
        showTemplatesCheck(organisation, genericConfig) &&
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
