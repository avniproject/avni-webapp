import React from "react";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { sideBarOptions } from "./ReportUtils";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import MetabaseSVG from "./Metabase_icon.svg";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
    backgroundColor: "#FFF"
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
      <Grid container alignItems={"center"} spacing={3}>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card className={classes.root}>
            <CardActionArea
              href={"https://reporting.avniproject.org"}
              target={"_blank"}
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              <CardContent>
                <Grid container wrap={"wrap"} spacing={2}>
                  <Grid item container direction={"row"} spacing={1}>
                    <Grid item>
                      <img
                        src={MetabaseSVG}
                        alt={"Metabase logo"}
                        style={{ heigth: 50, width: 50 }}
                      />
                    </Grid>
                    <Grid item xs={10}>
                      <Typography gutterBottom variant="h4" component="h4">
                        Metabase
                      </Typography>
                      <Typography variant="body2" color="textSecondary" component="p">
                        Metabase provides a graphical interface to create business intelligence and
                        analytics graphs in minutes. Avni integrates with Metabase to support ad hoc
                        and self serviced reports.
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button
                size="small"
                color="primary"
                href="https://www.metabase.com/docs/latest/getting-started.html"
                target={"_blank"}
              >
                Learn how to use Metabase
              </Button>
              <Button
                size="small"
                color="primary"
                href="https://reporting.avniproject.org"
                target={"_blank"}
              >
                Start exploring your data
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </ScreenWithAppBar>
  );
};

export default SelfServiceReports;
