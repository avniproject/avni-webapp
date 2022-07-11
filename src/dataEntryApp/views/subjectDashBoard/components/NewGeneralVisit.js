import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { isEmpty, get } from "lodash";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { Typography, Paper } from "@material-ui/core";
import { LineBreak } from "../../../../common/components/utils";
import { getEligibleEncounters, resetState } from "../../../reducers/encounterReducer";
import { Encounter } from "avni-models";
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

const NewGeneralVisit = ({ match, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const subjectUuid = match.queryParams.subjectUuid;

  useEffect(() => {
    props.resetState();
    props.getEligibleEncounters(subjectUuid);
  }, []);

  const scheduledEncounters = get(props, "eligibleEncounters.scheduledEncounters", []).map(pe => {
    const encounter = new Encounter();
    encounter.encounterType = pe.encounterType;
    encounter.encounterDateTime = pe.encounterDateTime;
    encounter.earliestVisitDateTime = pe.earliestVisitDateTime;
    encounter.maxVisitDateTime = pe.maxVisitDateTime;
    encounter.name = pe.name;
    encounter.uuid = pe.uuid;
    return encounter;
  });

  const actualEncounters = get(props, "eligibleEncounters.eligibleEncounterTypeUUIDs", []).map(
    uuid => {
      const encounter = new Encounter();
      encounter.encounterType = props.operationalModules.encounterTypes.find(
        eT => eT.uuid === uuid
      );
      encounter.name =
        encounter.encounterType && encounter.encounterType.operationalEncounterTypeName;
      return encounter;
    }
  );

  const sections = [];
  if (!isEmpty(scheduledEncounters)) {
    sections.push({ title: t("plannedVisits"), data: scheduledEncounters });
  }
  if (!isEmpty(actualEncounters)) {
    sections.push({ title: t("unplannedVisits"), data: actualEncounters });
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
