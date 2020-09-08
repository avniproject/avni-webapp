import React from "react";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { sideBarOptions } from "./ReportUtils";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import MetabaseSVG from "./Metabase_icon.svg";

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
    backgroundColor: "#FFF",
    display: "flex"
  },
  details: {
    display: "flex"
  },
  cover: {
    width: 151
  },
  content: {
    flex: "1 0 auto"
  }
});

const SelfServiceReports = () => {
  const classes = useStyles();
  return (
    <ScreenWithAppBar
      appbarTitle={`Self Service Reports`}
      enableLeftMenuButton={true}
      sidebarOptions={sideBarOptions}
    >
      <Card className={classes.root}>
        <CardActionArea
          href={"https://reporting.avniproject.org"}
          target={"_blank"}
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          <CardContent>
            <Grid container wrap="nowrap" spacing={2}>
              <Grid item>
                <img src={MetabaseSVG} alt={"Metabase logo"} style={{ heigth: 50, width: 50 }} />
              </Grid>
              <Grid item>
                <Typography gutterBottom variant="subtitle" component="h5">
                  Metabase
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  Metabase provides a graphical interface to create business intelligence and
                  analytics graphs in minutes. Avni integrates with Metabase to support ad hoc and
                  self serviced reports. Click here to start exploring your data.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
      </Card>
    </ScreenWithAppBar>
  );
};

export default SelfServiceReports;
