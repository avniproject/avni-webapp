import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { Typography, Paper } from "@mui/material";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { LineBreak } from "../../../../common/components/utils";
import { getEligibleEncounters, resetState } from "../../../reducers/encounterReducer";
import NewVisitMenuView from "./NewVisitMenuView";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { getNewEligibleEncounters } from "../../../../common/mapper/EncounterMapper";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  mainHeading: {
    fontSize: "20px"
  }
}));

const NewGeneralVisit = ({ match, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const subjectUuid = match.queryParams.subjectUuid;

  useEffect(() => {
    props.resetState();
    props.getEligibleEncounters(subjectUuid);
  }, []);

  const { scheduledEncounters, unplannedEncounters } = getNewEligibleEncounters(
    props.operationalModules.encounterTypes,
    props.eligibleEncounters
  );

  const sections = [];
  if (!isEmpty(scheduledEncounters)) {
    sections.push({ title: t("plannedVisits"), data: scheduledEncounters });
  }
  if (!isEmpty(unplannedEncounters)) {
    sections.push({ title: t("unplannedVisits"), data: unplannedEncounters });
  }

  return props.load ? (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        {!isEmpty(sections) ? (
          <>
            <Typography component={"span"} className={classes.mainHeading}>
              {t("newGeneralVisit")}
            </Typography>
            <LineBreak num={1} />
            <NewVisitMenuView sections={sections} uuid={subjectUuid} />
          </>
        ) : (
          <Typography variant="caption" gutterBottom>
            {" "}
            {t("no")} {t("plannedVisits")} / {t("unplannedVisits")}{" "}
          </Typography>
        )}
      </Paper>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={props.load} />
  );
};

const mapStateToProps = state => ({
  operationalModules: state.dataEntry.metadata.operationalModules,
  eligibleEncounters: state.dataEntry.encounterReducer.eligibleEncounters,
  load: state.dataEntry.loadReducer.load
});

const mapDispatchToProps = {
  getEligibleEncounters,
  resetState
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewGeneralVisit)
  )
);
