import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Icon from "@material-ui/core/Icon";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";
import React from "react";

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

export const HomePageCard = ({ href, name, customIcon, customIconComponent }) => (
  <CardActionArea style={classes.cardArea} href={href}>
    <Card style={classes.card} raised={true}>
      <CardContent style={{ marginTop: 10 }}>
        <Grid container direction="column" justifyContent="center" alignItems="center">
          <Grid item>
            {customIconComponent}
            {customIcon && (
              <Icon color="primary" style={{ fontSize: 100 }}>
                {customIcon}
              </Icon>
            )}
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
