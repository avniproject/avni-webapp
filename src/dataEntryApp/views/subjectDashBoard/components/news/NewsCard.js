import React from "react";
import { makeStyles } from "@mui/styles";
import { Grid, CardActionArea, CardContent, Typography, Card } from "@mui/material";
import { getFormattedDateTime } from "../../../../../adminApp/components/AuditUtil";

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
          <Grid
            container
            direction={"row"}
            spacing={2}
            sx={{
              alignItems: "center"
            }}
          >
            <Grid item>{renderImage()}</Grid>
            <Grid item container direction={"column"} xs={8}>
              <Grid item>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {title}
                </Typography>
              </Grid>
              <Grid item>
                <Typography sx={{ opacity: 0.7, mb: 1 }} variant="body2">
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
