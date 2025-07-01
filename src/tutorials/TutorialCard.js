import { makeStyles } from "@mui/styles";
import { Card, CardContent, Typography, CardActionArea, GridLegacy as Grid } from "@mui/material";
import React from "react";

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
    backgroundColor: "#FFF"
  }
});

const TutorialCard = ({ href, title, content, footer, iconComponent }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea href={href} target={"_blank"} style={{ color: "inherit", textDecoration: "inherit" }}>
        <CardContent>
          <Grid container wrap={"wrap"}>
            <Grid item container direction={"row"} spacing={1}>
              <Grid item>{iconComponent}</Grid>
              <Grid item xs={10}>
                <Typography sx={{ mb: 1 }} variant="h5" component="h2">
                  {title}
                </Typography>
                <Typography variant="body2" sx={{ color: theme => theme.palette.text.secondary }} component="p">
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
