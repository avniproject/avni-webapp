import React, { useState, useEffect } from "react";
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
import { debounce } from "lodash";

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

const SelfServiceReports = () => {
  const classes = useStyles();

  const [state, setState] = useState({
    setupLoading: false,
    setupDone: false,
    errorMessage: "",
    loadingRefresh: false
  });

  useEffect(() => {
    fetchSetupStatus();
  }, []);

  const fetchSetupStatus = async () => {
    try {
      const response = await fetch("/api/metabase/setup-status");
      if (response.ok) {
        const data = await response.json();
        setState(prevState => ({
          ...prevState,
          setupDone: data.setupEnabled
        }));
      } else {
        setState(prevState => ({
          ...prevState,
          errorMessage: "Failed to fetch setup status."
        }));
      }
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        errorMessage: `Error fetching setup status: ${error.message}`
      }));
    }
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
        const response = await fetch(`/api/metabase/setup-toggle?enabled=true`, {
          method: "POST"
        });

        if (response.ok) {
          const createQuestionsResponse = await fetch("/api/metabase/create-questions", {
            method: "POST"
          });

          if (createQuestionsResponse.ok) {
            setState(prevState => ({
              ...prevState,
              setupLoading: false,
              setupDone: true
            }));
          } else {
            throw new Error("Failed to create questions.");
          }
        } else {
          throw new Error("Failed to setup reports.");
        }
      } catch (error) {
        setTimeout(attemptSetup, 2000);
      }
    };
    attemptSetup();
  };

  const refreshReports = debounce(async () => {
    setState(prevState => ({
      ...prevState,
      loadingRefresh: true,
      errorMessage: ""
    }));
    try {
      const syncStatusResponse = await fetch("/api/metabase/sync-status", {
        method: "GET"
      });

      if (syncStatusResponse.ok) {
        const syncStatus = await syncStatusResponse.json();
        if (syncStatus === "INCOMPLETE") {
          setState(prevState => ({
            ...prevState,
            loadingRefresh: false,
            errorMessage: "Database sync is incomplete. Please try again later."
          }));
        } else {
          const response = await fetch("/api/metabase/create-questions", {
            method: "POST"
          });

          if (response.ok) {
            setState(prevState => ({
              ...prevState,
              loadingRefresh: false,
              errorMessage: ""
            }));
          } else {
            setState(prevState => ({
              ...prevState,
              loadingRefresh: false,
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
  }, 500);

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
                  <Button className={classes.setupButton} onClick={setupReports} disabled={state.setupLoading}>
                    Setup Reports
                  </Button>
                  {state.setupLoading && <CircularProgress size={24} />}
                </div>
              ) : (
                <div className={classes.setupDoneLabel}>Setup done</div>
              )}
            </CardContent>

            {state.setupDone && (
              <div className={classes.buttonsContainer}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Button className={classes.refreshButton} onClick={refreshReports} disabled={state.loadingRefresh}>
                    Refresh Reports
                  </Button>
                  {state.loadingRefresh && <CircularProgress size={24} />}
                </div>
                <Button className={classes.exploreButton} href="https://reporting-green.avniproject.org" target="_blank">
                  Explore Your Data
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
