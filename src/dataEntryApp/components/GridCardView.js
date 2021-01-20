import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(() => ({
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

const GridCardView = ({ cards, xs = 12, sm = 6, md = 3, lg = 2, xl = 2, noDataMessage }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Grid container className={classes.grid}>
      {cards && cards.length > 0 ? (
        cards.map((card, index) => {
          return (
            <Grid key={index} item xs={xs} sm={sm} md={md} lg={lg} xl={xl} className={classes.card}>
              {card}
            </Grid>
          );
        })
      ) : (
        <Typography component={"div"}>{noDataMessage || t("zeroNumberOfResults")}</Typography>
      )}
    </Grid>
  );
};

export default GridCardView;
