import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { get, isEmpty } from "lodash";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { Typography, Paper } from "@material-ui/core";
import { LineBreak } from "../../../../common/components/utils";
import {
  getEligibleProgramEncounters,
  resetState
} from "../../../reducers/programEncounterReducer";
import { ProgramEncounter } from "avni-models";
import NewVisitMenuView from "./NewVisitMenuView";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

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

  //Creating New programEncounter Object for Plan Encounter
  const planEncounterList = get(props, "eligibleEncounters.scheduledEncounters", []).map(
    planEncounter => {
      const planVisit = new ProgramEncounter();
      planVisit.encounterType = planEncounter.encounterType;
      planVisit.encounterDateTime = planEncounter.encounterDateTime;
      planVisit.earliestVisitDateTime = planEncounter.earliestVisitDateTime;
      planVisit.maxVisitDateTime = planEncounter.maxVisitDateTime;
      planVisit.name = planEncounter.name;
      planVisit.uuid = planEncounter.uuid;
      return planVisit;
    }
  );

  //Creating New programEncounter Object for Unplan Encounter
  const unplanEncounterList = get(props, "eligibleEncounters.eligibleEncounterTypeUUIDs", []).map(
    uuid => {
      const unplanVisit = new ProgramEncounter();
      unplanVisit.encounterType = props.operationalModules.encounterTypes.find(
        eT => eT.uuid === uuid
      );
      unplanVisit.name =
        unplanVisit.encounterType && unplanVisit.encounterType.operationalEncounterTypeName;
      return unplanVisit;
    }
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
