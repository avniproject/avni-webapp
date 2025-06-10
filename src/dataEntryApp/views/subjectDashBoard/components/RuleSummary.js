import React from "react";
import Observations from "../../../components/Observations";
import { makeStyles } from "@mui/styles";
import { CircularProgress, AccordionSummary, Typography, AccordionDetails, Accordion, Grid } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  expansionHeading: {
    fontSize: "1rem",
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "500",
    margin: "0"
  },
  expansionPanel: {
    marginBottom: "11px",
    borderRadius: "5px",
    boxShadow: "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  expandMoreHoriz: {
    color: "#0e6eff"
  }
}));

export const RuleSummary = ({ isFetching, title, summaryObservations = [] }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const renderNotFound = () => {
    return <Typography component={"span"}>{t("summaryNotFound")}</Typography>;
  };

  const renderObs = () => {
    return (
      <Grid item xs={12}>
        {isEmpty(summaryObservations) ? renderNotFound() : <Observations observations={summaryObservations} />}
      </Grid>
    );
  };

  const renderProgress = () => {
    return (
      <Grid item container xs={12} justifyContent={"center"}>
        <CircularProgress />
      </Grid>
    );
  };

  return (
    <Accordion className={classes.expansionPanel}>
      <AccordionSummary
        expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
        aria-controls="registrationPanelbh-content"
        id="summary"
      >
        <Typography component={"span"}>
          <p className={classes.expansionHeading}>{t(title)}</p>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid item container xs={12}>
          {isFetching ? renderProgress() : renderObs()}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
