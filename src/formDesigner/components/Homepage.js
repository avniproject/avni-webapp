import React from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import CardActionArea from "@material-ui/core/CardActionArea";

const Homepage = () => {
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
    <ScreenWithAppBar appbarTitle={"UI Designer"}>
      <Grid container justify="center">
        <CardActionArea style={classes.cardArea} href="/#/admin">
          <Card style={classes.card} raised={true}>
            <CardContent>
              <Typography align="center" color="primary" />
            </CardContent>
            <Typography
              variant="h5"
              component="h2"
              align="center"
              color="primary"
              style={{ marginTop: 30 }}
            >
              Admin
            </Typography>
          </Card>
        </CardActionArea>

        <CardActionArea style={classes.cardArea} href="/#/forms">
          <Card style={classes.card} raised={true}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom />
              <Typography align="center" color="primary" />
            </CardContent>
            <Typography
              variant="h5"
              component="h2"
              align="center"
              color="primary"
              style={{ marginTop: 30 }}
            >
              UI Designer
            </Typography>
          </Card>
        </CardActionArea>
      </Grid>
    </ScreenWithAppBar>
  );
};

export default Homepage;
