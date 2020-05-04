import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  getProgramEnrolment,
  getUnplanProgramEncounters
} from "../../../reducers/programEncounterReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import moment from "moment";
import _ from "lodash";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import { LineBreak } from "../../../../common/components/utils";
import { ModelGeneral as General, ProgramEncounter, ProgramEnrolment } from "avni-models";
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

const NewProgramVisit = ({ match, x, ...props }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const plannedEncounterList = [];
  const unplannedEncounterList = [];
  const enrolmentUuid = match.queryParams.uuid;
  const programUuid = match.queryParams.programUuid;
  useEffect(() => {
    //For Planned Encounters List : To get list of ProgramEncounters from api
    props.getProgramEnrolment(enrolmentUuid);
    //For Unplanned Encounters List : To get possible encounters from FormMapping
    // Using form type as "ProgramEncounter", program uuid, subject type uuid
    props.getUnplanProgramEncounters("Individual", programUuid);
  }, []);

  console.log("all state", x);

  //Creating New programEncounter Object for Planned Encounter
  props.plannedEncounters.map(planEncounter => {
    const plannedVisit = new ProgramEncounter();
    plannedVisit.uuid = planEncounter.uuid;
    plannedVisit.encounterType = planEncounter.encounterType; //select(state => state.operationalModules.encounterTypes.find(eT => eT.uuid = encounterTypeUuid));
    plannedVisit.encounterDateTime = new Date(); // moment().toDate(); or planEncounter.encounterDateTime
    plannedVisit.earliestVisitDateTime = planEncounter.earliestVisitDateTime;
    plannedVisit.maxVisitDateTime = planEncounter.maxVisitDateTime;
    plannedVisit.name = planEncounter.name;
    const programEnrolment = new ProgramEnrolment();
    programEnrolment.uuid = enrolmentUuid;
    plannedVisit.programEnrolment = programEnrolment;
    plannedVisit.observations = [];
    plannedEncounterList.push(plannedVisit);
  });

  //Creating New programEncounter Object for Unplanned Encounter
  props.unplannedEncounters.map(unplanEncounter => {
    const unplannedVisit = new ProgramEncounter();
    unplannedVisit.uuid = General.randomUUID();
    unplannedVisit.encounterType = props.operationalModules.encounterTypes.find(
      eT => eT.uuid === unplanEncounter.encounterTypeUUID
    );
    unplannedVisit.name =
      unplannedVisit.encounterType && unplannedVisit.encounterType.operationalEncounterTypeName;
    unplannedVisit.encounterDateTime = new Date();
    const programEnrolment = new ProgramEnrolment();
    programEnrolment.uuid = enrolmentUuid;
    unplannedVisit.programEnrolment = programEnrolment;
    unplannedVisit.observations = [];
    unplannedEncounterList.push(unplannedVisit);
  });

  const sections = [];
  if (!_.isEmpty(plannedEncounterList)) {
    sections.push({ title: t("plannedVisits"), data: plannedEncounterList });
  }
  if (!_.isEmpty(unplannedEncounterList)) {
    sections.push({ title: t("unplannedVisits"), data: unplannedEncounterList });
  }
  console.log("Logging sections", sections);

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
  plannedEncounters: state.dataEntry.programEncounterReducer.programEnrolment
    ? state.dataEntry.programEncounterReducer.programEnrolment.programEncounters
    : [],
  unplannedEncounters: state.dataEntry.programEncounterReducer.unplanProgramEncounters
    ? state.dataEntry.programEncounterReducer.unplanProgramEncounters
    : [],
  operationalModules: state.dataEntry.metadata.operationalModules,
  x: state
});

const mapDispatchToProps = {
  getProgramEnrolment,
  getUnplanProgramEncounters
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewProgramVisit)
  )
);
