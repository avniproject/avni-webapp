import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  card: {
    boxShadow: "0px 0px 0px 0px",
    borderRadius: "0",
    padding: "10px"
  },
  grid: {
    paddingBottom: "10px",
    padding: "10px"
  }
}));

const GridCardView = ({ cards, xs = 2, noDataMessage = "No Data" }) => {
  const classes = useStyles();
  return (
    <Grid container className={classes.grid}>
      {cards && cards.length > 0 ? (
        cards.map((card, index) => {
          return (
            <Grid key={index} item xs={xs} className={classes.card}>
              {card}
            </Grid>
          );
        })
      ) : (
        <Typography component={"div"}>{noDataMessage}</Typography>
      )}
    </Grid>
  );
};

export default GridCardView;
