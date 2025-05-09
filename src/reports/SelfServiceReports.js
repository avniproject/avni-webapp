import React, { useEffect, useState } from "react";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { reportSideBarOptions } from "./Common";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { Box, makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import MetabaseSVG from "./Metabase_icon.svg";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { debounce } from "lodash";
import DeleteIcon from "@material-ui/icons/Delete";
import httpClient from "../common/utils/httpClient";
import MetabaseSetupStatus from "./domain/MetabaseSetupStatus";
import { CopyToClipboard } from "react-copy-to-clipboard/lib/Component";
import WarningIcon from "@material-ui/icons/Warning";

const useStyles = makeStyles({
  root: {
    maxWidth: 600,
    backgroundColor: "#FFF",
    padding: "20px",
    position: "relative"
  },
  metabaseHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0px",
    marginBottom: "8px"
  },
  setupButtonContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginRight: 10
  },
  setupButton: {
    backgroundColor: "#4995ec",
    color: "#FFF",
    "&:hover": {
      backgroundColor: "#4995ec"
    }
  },
  setupDoneLabel: {
    position: "absolute",
    top: 20,
    right: 20,
    color: "green",
    border: "1px solid green",
    padding: "5px 10px",
    borderRadius: "5px",
    zIndex: 10
  },
  buttonsContainer: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10
  },
  refreshButton: {
    backgroundColor: "#4995ec",
    color: "#FFF",
    "&:hover": {
      backgroundColor: "#4995ec"
    }
  },
  exploreButton: {
    backgroundColor: "#4995ec",
    color: "#FFF",
    "&:hover": {
      backgroundColor: "#4995ec"
    }
  },
  metabaseLink: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "10px",
    color: "#757575",
    textDecoration: "none",
    margin: 0
  },
  redirectIcon: {
    fontSize: "1rem",
    marginLeft: "5px"
  },
  metabaseTitle: {
    marginBottom: 0,
    padding: 0
  }
});

async function getStatusResponse() {
  try {
    // Get metabase status
    const metabaseStatusResponse = (await httpClient.get("/web/metabase/status")).data;

    // Get organisation config to check sync status
    const orgConfigResponse = (await httpClient.get("/web/organisationConfig")).data;

    // Add sync status to the metabase status response only if it's a valid status
    if (orgConfigResponse && orgConfigResponse.organisationConfig) {
      const syncStatus = orgConfigResponse.organisationConfig.metabaseSyncStatus;
      // Only set the sync status if it's a valid value (TimedOut or AwaitingManualSchemaSyncCompletion)
      if (syncStatus === "TimedOut" || syncStatus === "AwaitingManualSchemaSyncCompletion") {
        metabaseStatusResponse.metabaseSyncStatus = syncStatus;
      }
    }

    return MetabaseSetupStatus.fromStatusResponse(metabaseStatusResponse);
  } catch (error) {
    console.error("Error fetching metabase status:", error);
    return MetabaseSetupStatus.createUnknownStatus();
  }
}

// not sure why useState didn't work for maintaining this state
let intervalId = null;

const SelfServiceReports = () => {
  const classes = useStyles();

  const [statusResponse, setStatusResponse] = useState(MetabaseSetupStatus.createUnknownStatus());
  const [isBusyCallingCreateQuestionOnly, setIsBusyCallingCreateQuestionOnly] = useState(false);
  const [isBusyCallingSetup, setIsBusyCallingSetup] = useState(false);
  const [isBusyCallingTearDown, setIsBusyCallingTearDown] = useState(false);
  const [isAwaitingSyncCompletion, setIsAwaitingSyncCompletion] = useState(false);

  useEffect(() => {
    updateStatus().then(status => {
      if (status.isAnyJobInProgress()) {
        pollSetupStatus();
      }
    });
  }, []);

  async function performAction(url) {
    await httpClient.post(url);
    pollSetupStatus();
  }

  // have to return statusResponse and use it in the caller to get the latest status as the state update is still waiting to happen
  async function updateStatus() {
    const statusResponse = await getStatusResponse();
    setStatusResponse(statusResponse);
    setIsAwaitingSyncCompletion(statusResponse.isAwaitingManualSchemaSyncCompletion());
    return statusResponse;
  }

  const pollSetupStatus = debounce(async () => {
    intervalId = setInterval(() => {
      updateStatus().then(status => {
        if (!status.isAnyJobInProgress() && intervalId) {
          clearInterval(intervalId);
          setIsBusyCallingCreateQuestionOnly(false);
          setIsBusyCallingSetup(false);
          setIsBusyCallingTearDown(false);
          intervalId = null;
        }
      });
    }, 5000);
  }, 500);

  const tearDownMetabase = debounce(async () => {
    setIsBusyCallingTearDown(true);
    await performAction("/web/metabase/teardown");
  }, 500);

  const setupReports = debounce(async () => {
    setIsBusyCallingSetup(true);
    // Clear any previous error states when starting a new setup
    if (statusResponse.hasTimedOut()) {
      // Reset the organisation config metabaseSyncStatus
      try {
        await httpClient.post("/web/organisationConfig/resetMetabaseSyncStatus");
      } catch (error) {
        console.error("Failed to reset sync status", error);
      }
      // Force refresh status to clear the UI
      await updateStatus();
    }
    await performAction("/web/metabase/setup");
  }, 500);

  const refreshReports = debounce(async () => {
    setIsBusyCallingCreateQuestionOnly(true);
    // Clear any previous error states when refreshing
    if (statusResponse.hasTimedOut()) {
      // Reset the organisation config metabaseSyncStatus
      try {
        await httpClient.post("/web/organisationConfig/resetMetabaseSyncStatus");
      } catch (error) {
        console.error("Failed to reset sync status", error);
      }
      // Force refresh status to clear the UI
      await updateStatus();
    }
    await performAction("/web/metabase/update-questions");
  }, 500);

  const isBusyCallingAnyAction = isBusyCallingCreateQuestionOnly || isBusyCallingSetup || isBusyCallingTearDown;

  const showSetupButton =
    !statusResponse.isSetupComplete() &&
    !isBusyCallingAnyAction &&
    statusResponse.canStartSetup() &&
    statusResponse.status !== MetabaseSetupStatus.NotEnabled;

  const showDisabledSetupButton =
    !statusResponse.isSetupComplete() &&
    !isBusyCallingAnyAction &&
    !statusResponse.canStartSetup() &&
    statusResponse.status !== MetabaseSetupStatus.NotEnabled;

  const showSetupDoneLabel = statusResponse.isSetupComplete() && !isBusyCallingAnyAction;

  // Only show Delete button when setup is complete
  const showDeleteButton = statusResponse.isSetupComplete() && !isBusyCallingAnyAction;

  // Never show disabled Delete button
  const showDisabledDeleteButton = false;

  // Only show Refresh button when setup is complete
  const showRefreshButton = statusResponse.isSetupComplete() && !isBusyCallingAnyAction;

  // Never show disabled Refresh button
  const showDisabledRefreshButton = false;

  const showExploreButton = statusResponse.isSetupComplete() && !isBusyCallingAnyAction;

  const showProgressSpinner = statusResponse.isAnyJobInProgress();
  const showTimedOutMessage = statusResponse.hasTimedOut();
  const showAwaitingSyncMessage = isAwaitingSyncCompletion;
  // Only show error message if it's not a timeout error
  const showErrorMessage = statusResponse.hasErrorMessage() && !showTimedOutMessage;

  return (
    <ScreenWithAppBar appbarTitle="Self Service Reports" enableLeftMenuButton={true} sidebarOptions={reportSideBarOptions}>
      <Card className={classes.root}>
        <CardContent>
          <Box>
            {showSetupDoneLabel && <div className={classes.setupDoneLabel}>Setup Complete</div>}
            <Box display="flex" alignItems="flex-start" mb={2}>
              <img src={MetabaseSVG} alt="Metabase logo" style={{ height: 50, width: 50 }} />
              <div className={classes.metabaseHeader}>
                <Typography variant="h4" component="h4" className={classes.metabaseTitle}>
                  Metabase
                </Typography>
                <a href="https://metabase.com" target="_blank" rel="noopener noreferrer" className={classes.metabaseLink}>
                  metabase.com
                  <OpenInNewIcon className={classes.redirectIcon} />
                </a>
              </div>
              {showSetupButton && (
                <div className={classes.setupButtonContainer}>
                  <Button className={classes.setupButton} onClick={setupReports} disabled={statusResponse.isSetupInProgress()}>
                    Setup Reports
                  </Button>
                </div>
              )}
              {showDisabledSetupButton && (
                <div className={classes.setupButtonContainer}>
                  <Button className={classes.setupButton} disabled={true}>
                    Setup Reports
                  </Button>
                </div>
              )}
            </Box>
            <Typography variant="body2" color="textSecondary" component="p">
              Metabase provides a graphical interface to create business intelligence and analytics graphs in minutes. Avni integrates with
              Metabase to support ad hoc and self-serviced reports.
            </Typography>
            <Box style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", gap: "10px" }}>
              {/* Always maintain the same button order: Refresh, Explore, Delete */}
              {/* Refresh Reports button - either enabled or disabled */}
              {showRefreshButton ? (
                <Button className={classes.refreshButton} onClick={refreshReports}>
                  Refresh Reports
                </Button>
              ) : showDisabledRefreshButton ? (
                <Button className={classes.refreshButton} disabled={true}>
                  Refresh Reports
                </Button>
              ) : null}

              {/* Explore Your Data button - only shown when enabled */}
              {showExploreButton && (
                <Button className={classes.exploreButton} href="https://reporting.avniproject.org" target="_blank">
                  Explore Your Data
                </Button>
              )}

              {/* Delete button - either enabled or disabled */}
              {showDeleteButton ? (
                <Button
                  style={{
                    color: "red"
                  }}
                  onClick={() => tearDownMetabase()}
                >
                  <DeleteIcon /> Delete
                </Button>
              ) : showDisabledDeleteButton ? (
                <Button disabled={true}>
                  <DeleteIcon /> Delete
                </Button>
              ) : null}

              {/* Progress spinner */}
              {showProgressSpinner && <CircularProgress size={24} style={{ marginLeft: "10px" }} />}
            </Box>
            {showErrorMessage && (
              <>
                <Typography variant="h6" color="error">
                  Last attempt failed with error
                </Typography>
                <Typography variant="body2" color="error">
                  {statusResponse.getShortErrorMessage()}
                </Typography>
                <br />
                <CopyToClipboard text={statusResponse.getErrorMessage()}>
                  <button>Copy error to clipboard</button>
                </CopyToClipboard>
              </>
            )}
            {showAwaitingSyncMessage && (
              <>
                <Typography variant="h6" style={{ color: "#f39c12" }}>
                  <Box display="flex" alignItems="center">
                    <WarningIcon style={{ marginRight: "8px" }} />
                    Setup in progress
                  </Box>
                </Typography>
                <Typography variant="body2">
                  Awaiting manual schema sync completion. This process may take some time. The setup will continue automatically once the
                  sync is complete.
                </Typography>
              </>
            )}
            {showTimedOutMessage && (
              <>
                <Typography variant="h6" style={{ color: "#e74c3c" }}>
                  <Box display="flex" alignItems="center">
                    <WarningIcon style={{ marginRight: "8px" }} />
                    Setup Incomplete
                  </Box>
                </Typography>
                <Typography variant="body2">
                  Previous attempt at setup was abandoned mid-way due to timeout while awaiting Metabase schema sync completion. You can try
                  setting up again.
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </ScreenWithAppBar>
  );
};

export default SelfServiceReports;
