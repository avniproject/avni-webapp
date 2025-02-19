import React, { useEffect, useState } from "react";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { reportSideBarOptions } from "./Common";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import MetabaseSVG from "./Metabase_icon.svg";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import _, { debounce } from "lodash";
import DeleteIcon from "@material-ui/icons/Delete";

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
    gap: "10px"
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
    borderRadius: "5px"
  },
  buttonsContainer: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
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

async function checkSyncStatusAndCreateQuestionsIfSyncCompleted(setState) {
  try {
    const syncStatusResponse = await fetch("/web/metabase/sync-status", {
      method: "GET"
    });

    if (syncStatusResponse.ok) {
      const syncStatus = await syncStatusResponse.json();
      if (syncStatus === "INCOMPLETE") {
        setState(prevState => ({
          ...prevState,
          setupDone: true,
          loadingRefresh: false,
          syncCompleted: false,
          errorMessage: "Database sync is incomplete. Please try again later."
        }));
      } else if (syncStatus === "NOT_STARTED") {
        setState(prevState => ({
          ...prevState,
          loadingRefresh: false,
          setupDone: false,
          syncCompleted: false,
          errorMessage: "Metabase setup has not been enabled. Please enable Metabase."
        }));
      } else {
        const response = await fetch("/web/metabase/create-questions", {
          method: "POST"
        });

        if (response.ok) {
          setState(prevState => ({
            ...prevState,
            loadingRefresh: false,
            setupDone: true,
            syncCompleted: true,
            errorMessage: ""
          }));
        } else {
          setState(prevState => ({
            ...prevState,
            loadingRefresh: false,
            setupDone: true,
            syncCompleted: true,
            errorMessage: "Failed to refresh reports."
          }));
        }
      }
    }
  } catch (error) {
    setState(prevState => ({
      ...prevState,
      loadingRefresh: false,
      errorMessage: `Error during refresh: ${error.message}`
    }));
  }
}

const SelfServiceReports = () => {
  const classes = useStyles();

  const [state, setState] = useState({
    setupLoading: false,
    setupDone: false,
    allowSetup: false,
    syncCompleted: false,
    errorMessage: "",
    loadingRefresh: false
  });

  useEffect(() => {
    fetchSetupStatus();
  }, []);

  const fetchSetupStatus = async () => {
    try {
      const response = await fetch("/web/metabase/setup-status");
      if (response.ok) {
        const data = await response.json();
        setState(prevState => ({
          ...prevState,
          loadingRefresh: true,
          allowSetup: true,
          syncCompleted: false,
          setupDone: data.setupEnabled
        }));
        await checkSyncStatusAndCreateQuestionsIfSyncCompleted(setState);
      } else {
        const errorResponse = await response.text();
        setState(prevState => ({
          ...prevState,
          errorMessage: errorResponse.includes("424 FAILED_DEPENDENCY")
            ? "Metabase Self-service is not enabled"
            : "Failed to fetch setup status.",
          syncCompleted: false,
          setupDone: false
        }));
      }
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        errorMessage: `Error fetching setup status: ${error.message}`,
        syncCompleted: false,
        setupDone: false
      }));
    }
  };

  const tearDownMetabase = async function() {
    setState(prevState => ({
      ...prevState,
      setupLoading: true
    }));
    await fetch(`/web/metabase/teardown`, {
      method: "POST"
    });
    setState(prevState => ({
      ...prevState,
      setupLoading: false,
      setupDone: false,
      syncCompleted: false,
      loadingRefresh: false,
      errorMessage: ""
    }));
  };

  const resetMessages = () => {
    setState(prevState => ({
      ...prevState,
      errorMessage: ""
    }));
  };

  const setupReports = async () => {
    resetMessages();
    setState(prevState => ({ ...prevState, setupLoading: true }));
    const attemptSetup = async () => {
      try {
        const response = await fetch(`/web/metabase/setup`, {
          method: "POST"
        });

        if (response.ok) {
          setState(prevState => ({
            ...prevState,
            setupLoading: false,
            setupDone: true,
            loadingRefresh: true,
            syncCompleted: false,
            errorMessage: ""
          }));
          await checkSyncStatusAndCreateQuestionsIfSyncCompleted(setState);
        } else {
          throw new Error("Failed to setup reports.");
        }
      } catch (error) {
        setState(prevState => ({
          ...prevState,
          setupLoading: false,
          errorMessage: error.message
        }));
      }
    };
    attemptSetup();
  };

  const refreshReports = debounce(async () => {
    setState(prevState => ({
      ...prevState,
      loadingRefresh: true,
      syncCompleted: false,
      errorMessage: ""
    }));
    await checkSyncStatusAndCreateQuestionsIfSyncCompleted(setState);
  }, 500);

  const disableDelete = false;

  return (
    <ScreenWithAppBar appbarTitle="Self Service Reports" enableLeftMenuButton={true} sidebarOptions={reportSideBarOptions}>
      <Grid container alignItems="center" spacing={3}>
        <Grid item xs={12} sm={12} md={8} lg={8} xl={8}>
          <Card className={classes.root}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item container direction="row" spacing={1}>
                  <Grid item>
                    <img src={MetabaseSVG} alt="Metabase logo" style={{ height: 50, width: 50 }} />
                  </Grid>
                  <Grid item xs={10}>
                    <div className={classes.metabaseHeader}>
                      <Typography variant="h4" component="h4" className={classes.metabaseTitle}>
                        Metabase
                      </Typography>
                      <a href="https://metabase.com" target="_blank" rel="noopener noreferrer" className={classes.metabaseLink}>
                        metabase.com
                        <OpenInNewIcon className={classes.redirectIcon} />
                      </a>
                    </div>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Metabase provides a graphical interface to create business intelligence and analytics graphs in minutes. Avni
                      integrates with Metabase to support ad hoc and self-serviced reports.
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {!state.setupDone ? (
                <div className={classes.setupButtonContainer}>
                  <Button className={classes.setupButton} onClick={setupReports} disabled={state.setupLoading || !state.allowSetup}>
                    Setup Reports
                  </Button>
                  {state.setupLoading && <CircularProgress size={24} />}
                </div>
              ) : (
                <div className={classes.setupDoneLabel}>Setup done</div>
              )}
            </CardContent>

            {state.allowSetup && state.setupDone && (
              <div className={classes.buttonsContainer}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Button
                    className={classes.refreshButton}
                    onClick={refreshReports}
                    disabled={state.loadingRefresh || !state.syncCompleted}
                  >
                    Refresh Reports
                  </Button>
                  {state.loadingRefresh && <CircularProgress size={24} />}
                </div>
                <Button className={classes.exploreButton} href="https://reporting-green.avniproject.org" target="_blank">
                  Explore Your Data
                </Button>
                <Button
                  disabled={!_.isEmpty(disableDelete)}
                  style={
                    !_.isEmpty(disableDelete)
                      ? { float: "right" }
                      : {
                          float: "right",
                          color: "red"
                        }
                  }
                  onClick={() => tearDownMetabase()}
                >
                  <DeleteIcon style={{ marginRight: 2 }} /> Delete
                </Button>
              </div>
            )}

            {state.errorMessage && (
              <Typography variant="body2" color="error">
                {state.errorMessage}
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </ScreenWithAppBar>
  );
};

export default SelfServiceReports;
