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
  const subjectUuid = match.queryParams.subjectUuid;

  useEffect(() => {
    // Get Plan & Unplan Encounters
    props.onLoad(subjectUuid);
  }, []);

  // Creating New Encounter Object for Plan Encounter
  props.subjectGeneral &&
    props.subjectGeneral
      .filter(e => isNil(e.encounterDateTime))
      .map(pe => {
        const encounter = new Encounter();
        encounter.encounterType = pe.encounterType;
        encounter.encounterDateTime = pe.encounterDateTime;
        encounter.earliestVisitDateTime = pe.earliestVisitDateTime;
        encounter.maxVisitDateTime = pe.maxVisitDateTime;
        encounter.name = pe.name;
        scheduledEncounters.push(encounter);
      });

  //Creating New Encounter Object for Unplan Encounter
  props.encounterFormMappings &&
    props.encounterFormMappings.map(fm => {
      const encounter = new Encounter();
      encounter.encounterType = props.operationalModules.encounterTypes.find(
        eT => eT.uuid === fm.encounterTypeUUID
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
        <NewVisitMenuView sections={sections} isForEncounters={true} />
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  subjectGeneral: state.dataEntry.subjectGenerel.subjectGeneral,
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
