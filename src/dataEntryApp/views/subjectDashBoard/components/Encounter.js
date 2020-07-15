import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { remove, isNil, isEqual } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  getEncounterForm,
  onLoad,
  updateEncounter,
  setEncounterDateValidation,
  resetState,
  createEncounter,
  createEncounterForScheduled
} from "../../../reducers/encounterReducer";
import EncounterForm from "./EncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const Encounter = ({ match, encounter, enconterDateValidation, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const ENCOUNTER_DATE_TIME = "ENCOUNTER_DATE_TIME";
  const encounterUuid = match.queryParams.encounterUuid;
  const subjectUuid = match.queryParams.subjectUuid;
  const uuid = match.queryParams.uuid;

  useEffect(() => {
    props.resetState();
    if (encounterUuid) {
      props.createEncounterForScheduled(encounterUuid);
    } else {
      //uuid - encounterTypeUuid
      props.createEncounter(uuid, subjectUuid);
    }
  }, []);

  const validationResultForEncounterDate =
    enconterDateValidation &&
    enconterDateValidation.find(vr => !vr.success && vr.formIdentifier === ENCOUNTER_DATE_TIME);
  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Grid justify="center" alignItems="center" container spacing={3}>
          <Grid item xs={12}>
            {props.encounterForm && encounter && props.subjectProfile ? (
              <EncounterForm>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    style={{ width: "30%" }}
                    label="Visit Date"
                    margin="none"
                    size="small"
                    id="date-picker-dialog"
                    format="MM/dd/yyyy"
                    placeholder="mm/dd/yyyy"
                    name="visitDateTime"
                    autoComplete="off"
                    required
                    value={new Date(encounter.encounterDateTime)}
                    error={
                      !isNil(validationResultForEncounterDate) &&
                      !validationResultForEncounterDate.success
                    }
                    helperText={
                      !isNil(validationResultForEncounterDate) &&
                      t(validationResultForEncounterDate.messageKey)
                    }
                    onChange={date => {
                      const visitDate = isNil(date) ? undefined : new Date(date);
                      props.updateEncounter("encounterDateTime", visitDate);
                      encounter.encounterDateTime = visitDate;
                      remove(
                        enconterDateValidation,
                        vr => vr.formIdentifier === ENCOUNTER_DATE_TIME
                      );
                      const result = encounter
                        .validate()
                        .find(vr => !vr.success && vr.formIdentifier === ENCOUNTER_DATE_TIME);
                      result
                        ? enconterDateValidation.push(result)
                        : enconterDateValidation.push(...encounter.validate());
                      props.setEncounterDateValidation(enconterDateValidation);
                    }}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                      color: "primary"
                    }}
                  />
                </MuiPickersUtilsProvider>
              </EncounterForm>
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
  encounterForm: state.dataEntry.encounterReducer.encounterForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  encounter: state.dataEntry.encounterReducer.encounter,
  enconterDateValidation: state.dataEntry.encounterReducer.enconterDateValidation
});

const mapDispatchToProps = {
  getEncounterForm,
  onLoad,
  updateEncounter,
  setEncounterDateValidation,
  resetState,
  createEncounter,
  createEncounterForScheduled
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Encounter)
  )
);
