import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { Grid, Paper } from "@mui/material";
import { isEqual } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  createCancelEncounter,
  editCancelEncounter,
  updateEncounter,
  resetState,
  fetchEncounterRulesResponse
} from "../../../reducers/encounterReducer";
import CancelEncounterForm from "./CancelEncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { AbstractEncounter } from "openchs-models";
import StaticFormElement from "dataEntryApp/views/viewmodel/StaticFormElement";
import { DateFormElement } from "dataEntryApp/components/DateFormElement";
import { LineBreak } from "../../../../common/components/utils";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const CancelEncounter = ({ match, encounter, ...props }) => {
  const classes = useStyles();
  const editCancelEncounter = isEqual(match.path, "/app/subject/editCancelEncounter");
  const encounterUuid = match.queryParams.uuid;

  useEffect(() => {
    props.resetState();
    if (editCancelEncounter) {
      props.editCancelEncounter(encounterUuid);
    } else {
      props.createCancelEncounter(encounterUuid);
    }
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Grid
          container
          spacing={3}
          sx={{
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Grid size={12}>
            {props.cancelEncounterForm && encounter && props.subjectProfile ? (
              <CancelEncounterForm fetchRulesResponse={fetchEncounterRulesResponse}>
                <DateFormElement
                  uuid={AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME}
                  formElement={new StaticFormElement("Cancel Date", true, false)}
                  value={encounter.cancelDateTime}
                />
                <LineBreak num={3} />
              </CancelEncounterForm>
            ) : (
              <CustomizedBackdrop load={false} />
            )}
          </Grid>
        </Grid>
      </Paper>
    </Fragment>
  );
};
const mapStateToProps = state => ({
  cancelEncounterForm: state.dataEntry.encounterReducer.encounterForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  encounter: state.dataEntry.encounterReducer.encounter
});
const mapDispatchToProps = {
  createCancelEncounter,
  editCancelEncounter,
  updateEncounter,
  resetState
};
export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CancelEncounter)
  )
);
