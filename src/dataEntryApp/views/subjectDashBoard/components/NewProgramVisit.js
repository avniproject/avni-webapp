import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getProgramEnrolment, getProgramEncounter } from "../../../reducers/programReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import moment from "moment";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableHead, TableCell, TableRow, Typography } from "@material-ui/core";
import { LineBreak, InternalLink } from "../../../../common/components/utils";
import { ModelGeneral as General, ProgramEncounter, ProgramEnrolment } from "avni-models";
import NewProgramVisitMenuView from "./NewProgramVisitMenuView";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const NewProgramVisit = ({ match, ...props }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const plannedEncounterList = [];
  const unplannedEncounterList = [];

  useEffect(() => {
    console.log("Heloo I am at New program visit");
    // props.getProgramEnrolment(match.queryParams.uuid);
    //props.getProgramEncounter("Individual", props.program.uuid);

    // (async function fetchData() {
    //   await props.getProgramEnrolment(match.queryParams.uuid);
    //   props.getProgramEncounter("Individual", match.queryParams.programUuid);
    //   // let programEnrolment = BrowserStore.fetchProgramEnrolment();
    //   // setProgramEnrolment(programEnrolment);
    // })();
    //For Planned Encounters List : To get list of ProgramEncounters from api
    props.getProgramEnrolment(match.queryParams.uuid);
    //For Unplanned Encounters List : To get possible encounters from FormMapping
    // Using form type as "ProgramEncounter", program uuid, subject type uuid
    props.getProgramEncounter("Individual", match.queryParams.programUuid);
  }, []);
  console.log("program", props.program);
  console.log("plannedVisits", props.plannedEncounters);
  //Creating New programEncounter Object for Planned Encounter
  props.plannedEncounters.map(planEncounter => {
    const plannedVisit = new ProgramEncounter();
    plannedVisit.uuid = planEncounter.uuid;
    plannedVisit.encounterType = planEncounter.encounterType; //select(state => state.operationalModules.encounterTypes.find(eT => eT.uuid = encounterTypeUuid));
    plannedVisit.encounterDateTime = moment().toDate(); //new Date(); or planEncounter.encounterDateTime
    plannedVisit.earliestVisitDateTime = planEncounter.earliestVisitDateTime;
    plannedVisit.maxVisitDateTime = planEncounter.maxVisitDateTime;
    plannedVisit.name = planEncounter.name;
    const programEnrolment = new ProgramEnrolment();
    programEnrolment.uuid = match.queryParams.uuid;
    plannedVisit.programEnrolment = programEnrolment;
    plannedVisit.observations = [];
    plannedEncounterList.push(plannedVisit);
  });

  //Creating New programEncounter Object for Unplanned Encounter
  props.unplannedEncounters.map(unplanEncounter => {
    const plannedVisit = new ProgramEncounter();
    console.log("New approach ..printing unplanEncounter");
    console.log(unplanEncounter);
    const unplannedVisit = new ProgramEncounter();
    unplannedVisit.uuid = General.randomUUID();
    // unplannedVisit.encounterType = select(state => state.operationalModules.encounterTypes.find(eT => eT.uuid = encounterTypeUuid));
    // unplannedVisit.name = unplannedVisit.encounterType.name;
    // unplannedVisit.encounterDateTime = new Date();
    // const programEnrolment = new ProgramEnrolment();
    // programEnrolment.uuid = enrolmentUuid;
    // unplannedVisit.programEnrolment = programEnrolment;
    // unplannedVisit.observations = [];
  });

  console.log("New plannedEncounterList...", plannedEncounterList);
  const sections = [
    { title: t("plannedVisits"), data: plannedEncounterList },
    { title: t("unplannedVisits"), data: unplannedEncounterList } //(!this.state.hideUnplanned)
  ];

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Typography variant="button" display="block" gutterBottom>
          New program visit
        </Typography>
        <LineBreak num={1} />
        <NewProgramVisitMenuView sections={sections} />
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  //   enrolForm: state.dataEntry.enrolmentReducer.enrolForm,
  //   subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  //   programEnrolment: state.dataEntry.enrolmentReducer.programEnrolment
  plannedEncounters: state.programs.programEnrolment
    ? state.programs.programEnrolment.programEncounters
    : [],

  unplannedEncounters: state.programs.programEncounter ? state.programs.programEncounter : [],

  program: state.programs.programEnrolment ? state.programs.programEnrolment.program : {},
  x: state
});

const mapDispatchToProps = {
  getProgramEnrolment,
  getProgramEncounter
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewProgramVisit)
  )
);

// const mapStateToProps = state => ({
//   validationResults: state.dataEntry.registration.validationResults
// });

// const mapDispatchToProps = {
//   setValidationResults
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(NewProgramVisit);
