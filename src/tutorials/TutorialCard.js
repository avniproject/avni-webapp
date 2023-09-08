import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";
import React from "react";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
    backgroundColor: "#FFF"
  }
});

const TutorialCard = ({ href, title, content, footer, icon, iconColor, iconComponent }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea
        href={href}
        target={"_blank"}
        style={{ color: "inherit", textDecoration: "inherit" }}
      >
        <CardContent>
          <Grid container wrap={"wrap"}>
            <Grid item container direction={"row"} spacing={1}>
              <Grid item>{iconComponent}</Grid>
              <Grid item xs={10}>
                <Typography gutterBottom variant="h5" component="h2">
                  {title}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {content}
                  {footer}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default TutorialCard;
