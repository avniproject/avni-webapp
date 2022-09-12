import React from "react";
import Observations from "../../../components/Observations";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Grid from "@material-ui/core/Grid";
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
    boxShadow:
      "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  expandMoreIcon: {
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
        {isEmpty(summaryObservations) ? (
          renderNotFound()
        ) : (
          <Observations observations={summaryObservations} />
        )}
      </Grid>
    );
  };

  const renderProgress = () => {
    return (
      <Grid item container xs={12} justify={"center"}>
        <CircularProgress />
      </Grid>
    );
  };

  return (
    <ExpansionPanel className={classes.expansionPanel}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
        aria-controls="registrationPanelbh-content"
        id="summary"
      >
        <Typography component={"span"}>
          <p className={classes.expansionHeading}>{t(title)}</p>
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid item container xs={12}>
          {isFetching ? renderProgress() : renderObs()}
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
