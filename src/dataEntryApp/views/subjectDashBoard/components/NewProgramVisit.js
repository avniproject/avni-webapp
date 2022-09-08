import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { Paper, Typography } from "@material-ui/core";
import { LineBreak } from "../../../../common/components/utils";
import {
  getEligibleProgramEncounters,
  resetState
} from "../../../reducers/programEncounterReducer";
import NewVisitMenuView from "./NewVisitMenuView";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { getNewEligibleProgramEncounters } from "../../../../common/mapper/ProgramEncounterMapper";

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

const NewProgramVisit = ({ match, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const enrolmentUuid = match.queryParams.enrolUuid;

  useEffect(() => {
    props.resetState();
    props.getEligibleProgramEncounters(enrolmentUuid);
  }, []);

  const { planEncounterList, unplanEncounterList } = getNewEligibleProgramEncounters(
    props.operationalModules.encounterTypes,
    props.eligibleEncounters
  );

  const sections = [];
  if (!isEmpty(planEncounterList)) {
    sections.push({ title: t("plannedVisits"), data: planEncounterList });
  }
  if (!isEmpty(unplanEncounterList)) {
    sections.push({ title: t("unplannedVisits"), data: unplanEncounterList });
  }

  return props.load ? (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        {!isEmpty(sections) ? (
          <>
            <Typography component={"span"} className={classes.mainHeading}>
              {t("newProgramVisit")}
            </Typography>
            <LineBreak num={1} />
            <NewVisitMenuView
              sections={sections}
              uuid={enrolmentUuid}
              isForProgramEncounters={true}
            />
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
  eligibleEncounters: state.dataEntry.programEncounterReducer.eligibleEncounters,
  operationalModules: state.dataEntry.metadata.operationalModules,
  load: state.dataEntry.loadReducer.load
});

const mapDispatchToProps = {
  getEligibleProgramEncounters,
  resetState
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewProgramVisit)
  )
);
