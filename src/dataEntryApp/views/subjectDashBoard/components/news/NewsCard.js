import React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { getFormattedDateTime } from "../../../../../adminApp/components/AuditUtil";
import Card from "@material-ui/core/Card";

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: theme.spacing(20),
    width: "100%",
    disableRipple: true
  },
  actionArea: {
    "&:hover $focusHighlight": {
      opacity: 0
    }
  },
  focusHighlight: {}
}));

export const NewsCard = ({ signedHeroImage, title, publishedDate, id }) => {
  const classes = useStyles();
  const renderImage = () =>
    signedHeroImage ? (
      <img src={signedHeroImage} alt={title} width={"204px"} height={"120px"} />
    ) : (
      <div style={{ width: "204px", height: "120px" }} />
    );

  return (
    <Card className={classes.root}>
      <CardActionArea
        disableRipple
        href={`#/app/news/${id}/details`}
        classes={{
          root: classes.actionArea,
          focusHighlight: classes.focusHighlight
        }}
      >
        <CardContent>
          <Grid container direction={"row"} spacing={2} alignItems={"center"}>
            <Grid item>{renderImage()}</Grid>
            <Grid item container direction={"column"} xs={8}>
              <Grid item>
                <Typography variant="h5" gutterBottom>
                  {title}
                </Typography>
              </Grid>
              <Grid item>
                <Typography style={{ opacity: 0.7 }} variant="body2" gutterBottom>
                  {getFormattedDateTime(publishedDate)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
