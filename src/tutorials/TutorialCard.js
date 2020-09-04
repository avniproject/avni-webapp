import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";
import React from "react";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/es/Grid/Grid";
import Icon from "@material-ui/core/Icon";
import { red } from "@material-ui/core/colors";

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
    backgroundColor: "#FFF"
  }
});

const TutorialCard = ({ href, title, content, footer, icon, iconColor }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea
        href={href}
        target={"_blank"}
        style={{ color: "inherit", textDecoration: "inherit" }}
      >
        <CardContent>
          <Grid container wrap="nowrap" spacing={2}>
            <Grid item>
              <Icon style={{ fontSize: 60, color: iconColor }}>{icon}</Icon>
            </Grid>
            <Grid item>
              <Typography gutterBottom variant="h5" component="h2">
                {title}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                {content}
                {footer}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default TutorialCard;
