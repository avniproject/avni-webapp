import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import CardActionArea from "@material-ui/core/CardActionArea";
import React from "react";

const useStyles = makeStyles({
  card: {
    width: 220,
    height: 220,
    justifyContent: "center",
    transition: "transform 0.4s ease-in-out",
    "&:hover": {
      textDecoration: "None",
      transform: "scale(1.03)",
      boxShadow: "0 4px 20px rgba(7, 6, 6, 0.2)"
    }
  },
  cardArea: {
    width: 220,
    height: 220,
    justifyContent: "center",
    margin: 50,
    textDecoration: "none"
  }
});

export const HomePageCard = ({ href, name, customIconComponent }) => {
  const classes = useStyles(); // Use defined styles

  return (
    <CardActionArea className={classes.cardArea} href={href} style={{ textDecoration: "None" }}>
      <Card className={classes.card} raised>
        <CardContent style={{ marginTop: 10 }}>
          <Grid container direction="column" justifyContent="center" alignItems="center">
            <Grid item>{customIconComponent}</Grid>
            <Grid item>
              <Typography variant="h5" component="h2" align="center" color="secondary" style={{ marginTop: 5 }}>
                {name}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </CardActionArea>
  );
};
