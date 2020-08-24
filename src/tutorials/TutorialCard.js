import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";
import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
    backgroundColor: "#FFF"
  }
});

const TutorialCard = ({ href, title, content, footer }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea
        href={href}
        target={"_blank"}
        style={{ color: "inherit", textDecoration: "inherit" }}
      >
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {content}
            {footer}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default TutorialCard;
