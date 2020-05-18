import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { isEmpty, isNil } from "lodash";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { Typography, Paper } from "@material-ui/core";
import { LineBreak } from "../../../../common/components/utils";
import { onLoad } from "../../../reducers/programEncounterReducer";
import { ProgramEncounter } from "avni-models";
import NewProgramVisitMenuView from "./NewProgramVisitMenuView";

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
  const planEncounterList = [];
  const unplanEncounterList = [];
  const enrolmentUuid = match.queryParams.enrolUuid;

  useEffect(() => {
    //Get Plan & Unplan Encounters
    props.onLoad(enrolmentUuid);
  }, []);

  //Creating New programEncounter Object for Plan Encounter
  props.planEncounters
    .filter(pe => isNil(pe.encounterDateTime))
    .map(planEncounter => {
      const planVisit = new ProgramEncounter();
      planVisit.encounterType = planEncounter.encounterType;
      planVisit.encounterDateTime = planEncounter.encounterDateTime;
      planVisit.earliestVisitDateTime = planEncounter.earliestVisitDateTime;
      planVisit.name = planEncounter.name;
      planEncounterList.push(planVisit);
    });

  //Creating New programEncounter Object for Unplan Encounter
  props.unplanEncounters.map(unplanEncounter => {
    const unplanVisit = new ProgramEncounter();
    unplanVisit.encounterType = props.operationalModules.encounterTypes.find(
      eT => eT.uuid === unplanEncounter.encounterTypeUUID
    );
    unplanVisit.name =
      unplanVisit.encounterType && unplanVisit.encounterType.operationalEncounterTypeName;
    unplanEncounterList.push(unplanVisit);
  });

  const sections = [];
  if (!isEmpty(planEncounterList)) {
    sections.push({ title: t("plannedVisits"), data: planEncounterList });
  }
  if (!isEmpty(unplanEncounterList)) {
    sections.push({ title: t("unplannedVisits"), data: unplanEncounterList });
  }

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Typography component={"span"} className={classes.mainHeading}>
          New program visit
        </Typography>
        <LineBreak num={1} />
        <NewProgramVisitMenuView sections={sections} enrolmentUuid={enrolmentUuid} />
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  planEncounters: state.dataEntry.programEncounterReducer.programEnrolment
    ? state.dataEntry.programEncounterReducer.programEnrolment.programEncounters
    : [],
  unplanEncounters: state.dataEntry.programEncounterReducer.unplanProgramEncounters
    ? state.dataEntry.programEncounterReducer.unplanProgramEncounters
    : [],
  operationalModules: state.dataEntry.metadata.operationalModules
});

const mapDispatchToProps = {
  onLoad
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewProgramVisit)
  )
);
