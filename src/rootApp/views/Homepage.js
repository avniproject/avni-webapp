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

  const renderCard = (href, name) => (
    <CardActionArea style={classes.cardArea} href={href}>
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
          {name}
        </Typography>
      </Card>
    </CardActionArea>
  );

  return (
    <ScreenWithAppBar appbarTitle={"Avni Web Console"}>
      <Grid container justify="center">
        {renderCard("/#/admin/user", "Admin")}
        {renderCard("/#/translations", "Translations")}
        {renderCard("/#/export", "Reports")}
      </Grid>
    </ScreenWithAppBar>
  );
};

export default Homepage;
