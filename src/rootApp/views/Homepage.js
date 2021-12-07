import React from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Icon from "@material-ui/core/Icon";

import CardActionArea from "@material-ui/core/CardActionArea";
import httpClient from "../../common/utils/httpClient";

const Homepage = ({ user }) => {
  httpClient.saveAuthTokenForAnalyticsApp();

  const renderCard = (href, name, customicon) => (
    <CardActionArea style={classes.cardArea} href={href}>
      <Card style={classes.card} raised={true}>
        <CardContent style={{ marginTop: 10 }}>
          <Grid container direction="column" justify="center" alignItems="center">
            <Grid item>
              <Icon color="primary" style={{ fontSize: 100 }}>
                {customicon}
              </Icon>
            </Grid>
            <Grid item>
              <Typography
                variant="h5"
                component="h2"
                align="center"
                color="secondary"
                style={{ marginTop: 5 }}
              >
                {name}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </CardActionArea>
  );

  const classes = {
    card: {
      width: 220,
      height: 220,
      justify: "center"
    },
    cardArea: {
      width: 220,
      height: 220,
      justify: "center",
      margin: 50,
      textDecoration: "none"
    },

    typography: {
      justify: "center"
    }
  };

  return (
    <ScreenWithAppBar appbarTitle={"Avni Web Console"}>
      <Grid container justify="center">
        {renderCard("/#/admin/user", "Admin", "supervisor_account")}
        {renderCard("/#/appdesigner", "App Designer", "architecture")}
        {renderCard("/#/news", "News Broadcasts", "speaker")}
        {renderCard("/#/translations", "Translations", "translate")}
        {renderCard("/#/export", "Reports", "assessment")}
        {renderCard("/#/app", "Data Entry App", "keyboard")}
        {renderCard("/#/help", "Support And Training", "help")}
        {renderCard("/analytics/activities", "Canned Reports", "assessment")}
      </Grid>
    </ScreenWithAppBar>
  );
};

export default Homepage;
