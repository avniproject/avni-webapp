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
import { onLoad } from "../../../reducers/encounterReducer";
import { Encounter } from "avni-models";
import NewVisitMenuView from "./NewVisitMenuView";

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
  const scheduledEncounters = [];
  const actualEncounters = [];
  const enrolmentUuid = match.queryParams.enrolUuid;

  useEffect(() => {
    // Get Plan & Unplan Encounters
    props.onLoad(enrolmentUuid);
  }, []);

  console.log("actualEncounters", props.actualEncounters);

  //Creating New programEncounter Object for Plan Encounter
  // props.planEncounters
  //     .filter(pe => isNil(pe.encounterDateTime))
  //     .map(planEncounter => {
  //         const planVisit = new ProgramEncounter();
  //         planVisit.encounterType = planEncounter.encounterType;
  //         planVisit.encounterDateTime = planEncounter.encounterDateTime;
  //         planVisit.earliestVisitDateTime = planEncounter.earliestVisitDateTime;
  //         planVisit.name = planEncounter.name;
  //         scheduledEncounters.push(planVisit);
  //     });

  //Creating New Encounter Object for Unplan Encounter
  props.encounterFormMappings &&
    props.encounterFormMappings.map(actualEncounter => {
      const encounter = new Encounter();
      encounter.encounterType = props.operationalModules.encounterTypes.find(
        eT => eT.uuid === actualEncounter.encounterTypeUUID
      );
      encounter.name =
        encounter.encounterType && encounter.encounterType.operationalEncounterTypeName;
      actualEncounters.push(encounter);
    });

  const sections = [];
  if (!isEmpty(scheduledEncounters)) {
    sections.push({ title: t("plannedVisits"), data: scheduledEncounters });
  }
  if (!isEmpty(actualEncounters)) {
    sections.push({ title: t("unplannedVisits"), data: actualEncounters });
  }

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Typography component={"span"} className={classes.mainHeading}>
          {t("newGeneralVisit")}
        </Typography>
        <LineBreak num={1} />
        <NewVisitMenuView sections={sections} enrolmentUuid={enrolmentUuid} />
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  // planEncounters: state.dataEntry.programEncounterReducer.programEnrolment
  //     ? state.dataEntry.programEncounterReducer.programEnrolment.programEncounters
  //     : [],
  operationalModules: state.dataEntry.metadata.operationalModules,
  encounterFormMappings: state.dataEntry.encounterReducer.encounterFormMappings
});

const mapDispatchToProps = {
  onLoad
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewGeneralVisit)
  )
);
