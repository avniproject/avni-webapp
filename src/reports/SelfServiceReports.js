import React, { useState, useEffect } from "react";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { reportSideBarOptions } from "./Common";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import MetabaseSVG from "./Metabase_icon.svg";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";
import CircularProgress from "@material-ui/core/CircularProgress";

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

const SelfServiceReports = () => {
  const classes = useStyles();
  const [setupEnabled, setSetupEnabled] = useState(false);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSetupToggle = async () => {
    setLoadingSetup(true);
    try {
      const response = await fetch("/api/metabase/setup-toggle?enabled=" + !setupEnabled, {
        method: "POST"
      });
      const data = await response.json();
      if (response.ok) {
        setSetupEnabled(!setupEnabled);
        setErrorMessage(data.message.includes("could not be created") ? data.message : "");
      } else {
        console.error("Failed to toggle setup.");
      }
    } catch (error) {
      console.error("Error during setup toggle:", error);
    }
    setLoadingSetup(false);
  };

  const handleRefreshTables = async () => {
    setLoadingRefresh(true);
    try {
      const response = await fetch("/api/metabase/create-questions", {
        method: "POST"
      });
      if (!response.ok) {
        console.error("Failed to refresh tables.");
        setErrorMessage("Failed to refresh tables. Please try again.");
      }
    } catch (error) {
      console.error("Error during refresh:", error);
      setErrorMessage("Failed to refresh tables. Please try again.");
    }
    setLoadingRefresh(false);
  };

  const handleCheckSyncStatus = async () => {
    try {
      const response = await fetch("/api/metabase/sync-status", {
        method: "GET"
      });
      if (response.ok) {
        const status = await response.json();
        setSyncStatus(status);
      } else {
        setSyncStatus("Error retrieving sync status");
      }
    } catch (error) {
      console.error("Error fetching sync status:", error);
      setSyncStatus("Error fetching sync status");
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
                      integrates with Metabase to support ad hoc and self serviced reports.
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>

            <CardActions className={classes.actionAreaContainer}>
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
                <Button
                  size="small"
                  color="primary"
                  className={classes.buttonSpacing}
                  onClick={handleCheckSyncStatus}
                  disabled={!setupEnabled}
                >
                  Check Sync Status
                </Button>
              </div>

              <div className={classes.topRightButtons}>
                <Button size="small" color="primary" href="https://www.metabase.com/docs/latest/getting-started.html" target={"_blank"}>
                  Learn how to use Metabase
                </Button>
                <Button size="small" color="primary" href="https://reporting.avniproject.org" target={"_blank"}>
                  Start exploring your data
                </Button>
              </div>
            </CardActions>

            {errorMessage && (
              <Typography variant="body2" color="error" className={classes.errorMessage}>
                {errorMessage}
              </Typography>
            )}

            {syncStatus && (
              <Typography
                variant="body2"
                component="p"
                className={classes.message}
                style={{
                  color: syncStatus === "COMPLETE" ? "green" : "red"
                }}
              >
                Sync Status: {syncStatus}
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </ScreenWithAppBar>
  );
};

export default SelfServiceReports;
