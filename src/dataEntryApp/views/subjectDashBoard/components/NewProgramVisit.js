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
import { onLoad, resetState } from "../../../reducers/programEncounterReducer";
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
  const planEncounterList = [];
  const unplanEncounterList = [];
  const enrolmentUuid = match.queryParams.enrolUuid;

  useEffect(() => {
    props.resetState();
    //Get Plan & Unplan Encounters
    props.onLoad(enrolmentUuid);
  }, []);

  //Creating New programEncounter Object for Plan Encounter
  props.planEncounters
    .filter(pe => isNil(pe.encounterDateTime) && isNil(pe.cancelDateTime))
    .map(planEncounter => {
      const planVisit = new ProgramEncounter();
      planVisit.encounterType = planEncounter.encounterType;
      planVisit.encounterDateTime = planEncounter.encounterDateTime;
      planVisit.earliestVisitDateTime = planEncounter.earliestVisitDateTime;
      planVisit.maxVisitDateTime = planEncounter.maxVisitDateTime;
      planVisit.name = planEncounter.name;
      planVisit.uuid = planEncounter.uuid;
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
  planEncounters: state.dataEntry.programEncounterReducer.programEnrolment
    ? state.dataEntry.programEncounterReducer.programEnrolment.programEncounters
    : [],
  unplanEncounters: state.dataEntry.programEncounterReducer.unplanProgramEncounters
    ? state.dataEntry.programEncounterReducer.unplanProgramEncounters
    : [],
  operationalModules: state.dataEntry.metadata.operationalModules,
  load: state.dataEntry.loadReducer.load
});

const mapDispatchToProps = {
  onLoad,
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
