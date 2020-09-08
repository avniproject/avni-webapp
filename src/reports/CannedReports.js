import React from "react";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { sideBarOptions } from "./ReportUtils";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
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
  content: {
    flex: "1 0 auto"
  }
});

const CannedReports = () => {
  const classes = useStyles();
  return (
    <ScreenWithAppBar
      appbarTitle={`Canned Reports`}
      enableLeftMenuButton={true}
      sidebarOptions={sideBarOptions}
    >
      <Typography variant="h2" component="h2" align="center">
        Coming Soon!
      </Typography>
    </ScreenWithAppBar>
  );
};

export default CannedReports;
