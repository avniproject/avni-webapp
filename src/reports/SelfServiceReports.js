import React, { useState } from "react";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { reportSideBarOptions } from "./Common";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";
import CircularProgress from "@material-ui/core/CircularProgress";

import MetabaseSVG from "./Metabase_icon.svg";

const useStyles = makeStyles({
  root: {
    maxWidth: 600,
    backgroundColor: "#FFF"
  },
  topRightButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px"
  },
  actionAreaContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  buttonSpacing: {
    marginLeft: "10px"
  },
  message: {
    color: "green",
    marginTop: "10px"
  },
  errorMessage: {
    color: "red",
    marginTop: "10px"
  }
});

const SetupActions = ({ setupEnabled, loadingSetup, handleSetupToggle, handleRefreshTables, loadingRefresh, handleCheckSyncStatus }) => {
  const classes = useStyles();
  return (
    <div>
      <Switch
        checked={setupEnabled}
        onChange={handleSetupToggle}
        disabled={loadingSetup}
        color="primary"
        name="metabaseSetup"
        inputProps={{ "aria-label": "Metabase Setup Toggle" }}
      />
      {loadingSetup && <CircularProgress size={24} />}
      <Button
        size="small"
        color="primary"
        className={classes.buttonSpacing}
        onClick={handleRefreshTables}
        disabled={!setupEnabled || loadingRefresh}
      >
        {loadingRefresh ? <CircularProgress size={24} /> : "Refresh Tables"}
      </Button>
      <Button size="small" color="primary" className={classes.buttonSpacing} onClick={handleCheckSyncStatus} disabled={!setupEnabled}>
        Check Sync Status
      </Button>
    </div>
  );
};

const SelfServiceReports = () => {
  const classes = useStyles();

  const [state, setState] = useState({
    setupEnabled: false,
    loadingSetup: false,
    loadingRefresh: false,
    syncStatus: "",
    errorMessage: "",
    successMessage: ""
  });

  const resetMessages = () => {
    setState(prevState => ({
      ...prevState,
      errorMessage: "",
      successMessage: ""
    }));
  };

  const handleSetupToggle = async () => {
    setState({ ...state, loadingSetup: true });
    resetMessages();
    try {
      const response = await fetch(`/api/metabase/setup-toggle?enabled=${!state.setupEnabled}`, {
        method: "POST"
      });
      const data = await response.json();
      if (response.ok) {
        setState(prevState => ({
          ...prevState,
          setupEnabled: !state.setupEnabled,
          errorMessage: data.message.includes("could not be created") ? data.message : "",
          successMessage: data.message.includes("could not be created") ? "" : "Setup toggled successfully!"
        }));
      } else {
        setState(prevState => ({
          ...prevState,
          errorMessage: "Failed to toggle setup."
        }));
      }
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        errorMessage: "Error during setup toggle: " + error.message
      }));
    } finally {
      setState(prevState => ({ ...prevState, loadingSetup: false }));
    }
  };

  const handleRefreshTables = async () => {
    setState(prevState => ({
      ...prevState,
      loadingRefresh: true,
      errorMessage: "",
      successMessage: ""
    }));

    try {
      const syncStatusResponse = await fetch("/api/metabase/sync-status", {
        method: "GET"
      });

      if (syncStatusResponse.ok) {
        const currentSyncStatus = await syncStatusResponse.json();

        if (currentSyncStatus === "INCOMPLETE") {
          setState(prevState => ({
            ...prevState,
            syncStatus: currentSyncStatus,
            errorMessage:
              "Metabase setup enabled, but questions could not be created. Database sync is incomplete. Please refresh tables after sync is complete.",
            successMessage: ""
          }));
        } else {
          const response = await fetch("/api/metabase/create-questions", {
            method: "POST"
          });

          if (!response.ok) {
            setState(prevState => ({
              ...prevState,
              errorMessage: "Failed to refresh tables. Please try again.",
              successMessage: ""
            }));
          } else {
            setState(prevState => ({
              ...prevState,
              syncStatus: currentSyncStatus,
              errorMessage: "",
              successMessage: "Questions created successfully!"
            }));
          }
        }
      } else {
        setState(prevState => ({
          ...prevState,
          errorMessage: "Error checking sync status. Please try again.",
          successMessage: ""
        }));
      }
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        errorMessage: "Error during refresh: " + error.message,
        successMessage: ""
      }));
    } finally {
      setState(prevState => ({ ...prevState, loadingRefresh: false }));
    }
  };

  const handleCheckSyncStatus = async () => {
    try {
      const response = await fetch("/api/metabase/sync-status", {
        method: "GET"
      });
      if (response.ok) {
        const status = await response.json();
        setState({ ...state, syncStatus: status });
      } else {
        setState({ ...state, syncStatus: "Error retrieving sync status" });
      }
    } catch (error) {
      setState({ ...state, syncStatus: "Error fetching sync status" });
    }
  };

  return (
    <ScreenWithAppBar appbarTitle={`Self Service Reports`} enableLeftMenuButton={true} sidebarOptions={reportSideBarOptions}>
      <Grid container alignItems={"center"} spacing={3}>
        <Grid item xs={12} sm={12} md={8} lg={8} xl={8}>
          <Card className={classes.root}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item container direction={"row"} spacing={1}>
                  <Grid item>
                    <img src={MetabaseSVG} alt={"Metabase logo"} style={{ height: 50, width: 50 }} />
                  </Grid>
                  <Grid item xs={10}>
                    <Typography gutterBottom variant="h4" component="h4">
                      Metabase
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Metabase provides a graphical interface to create business intelligence and analytics graphs in minutes. Avni
                      integrates with Metabase to support ad hoc and self-serviced reports.
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>

            <CardActions className={classes.actionAreaContainer}>
              <SetupActions
                setupEnabled={state.setupEnabled}
                loadingSetup={state.loadingSetup}
                handleSetupToggle={handleSetupToggle}
                handleRefreshTables={handleRefreshTables}
                loadingRefresh={state.loadingRefresh}
                handleCheckSyncStatus={handleCheckSyncStatus}
              />

              <div className={classes.topRightButtons}>
                <Button size="small" color="primary" href="https://www.metabase.com/docs/latest/getting-started.html" target={"_blank"}>
                  Learn how to use Metabase
                </Button>
                <Button size="small" color="primary" href="https://reporting.avniproject.org" target={"_blank"}>
                  Start exploring your data
                </Button>
              </div>
            </CardActions>

            {state.errorMessage ? (
              <Typography variant="body2" className={classes.errorMessage}>
                {state.errorMessage}
              </Typography>
            ) : state.successMessage ? (
              <Typography variant="body2" component="p" className={classes.message}>
                {state.successMessage}
              </Typography>
            ) : null}

            {/* show sync status */}
            {state.syncStatus && (
              <Typography
                variant="body2"
                component="p"
                className={classes.message}
                style={{
                  color: state.syncStatus === "COMPLETE" ? "green" : "red"
                }}
              >
                Sync Status: {state.syncStatus}
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </ScreenWithAppBar>
  );
};

export default SelfServiceReports;
