import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Typography } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { remove, isNil, isEqual } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  onLoad,
  updateProgramEncounter,
  setEncounterDateValidation,
  editProgramEncounter,
  resetState,
  createProgramEncounter,
  createProgramEncounterForScheduled
} from "../../../reducers/programEncounterReducer";
import ProgramEncounterForm from "./ProgramEncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const ProgramEncounter = ({ match, programEncounter, enconterDateValidation, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const ENCOUNTER_DATE_TIME = "ENCOUNTER_DATE_TIME";
  const editProgramEncounter = isEqual(match.path, "/app/subject/editProgramEncounter");
  const encounterUuid = match.queryParams.encounterUuid;
  const enrolUuid = match.queryParams.enrolUuid;
  const uuid = match.queryParams.uuid;

  useEffect(() => {
    props.resetState();
    if (editProgramEncounter) {
      props.editProgramEncounter(uuid);
    } else if (encounterUuid) {
      //encounterUuid - programEncounterUuid
      props.createProgramEncounterForScheduled(encounterUuid);
    } else {
      //uuid - encounterTypeUuid
      props.createProgramEncounter(uuid, enrolUuid);
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
            {props.programEncounterForm && programEncounter && props.subjectProfile ? (
              <ProgramEncounterForm>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Typography
                    variant="body1"
                    gutterBottom
                    style={{ width: "50%", marginBottom: 10, color: "rgba(0, 0, 0, 0.54)" }}
                  >
                    Visit Date
                  </Typography>
                  <KeyboardDatePicker
                    style={{ width: "30%" }}
                    margin="none"
                    size="small"
                    id="date-picker-dialog"
                    format="MM/dd/yyyy"
                    placeholder="mm/dd/yyyy"
                    name="visitDateTime"
                    autoComplete="off"
                    required
                    value={new Date(programEncounter.encounterDateTime)}
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
                      props.updateProgramEncounter("encounterDateTime", visitDate);
                      programEncounter.encounterDateTime = visitDate;
                      remove(
                        enconterDateValidation,
                        vr => vr.formIdentifier === ENCOUNTER_DATE_TIME
                      );
                      const result = programEncounter
                        .validate()
                        .find(vr => !vr.success && vr.formIdentifier === ENCOUNTER_DATE_TIME);
                      result
                        ? enconterDateValidation.push(result)
                        : enconterDateValidation.push(...programEncounter.validate());
                      props.setEncounterDateValidation(enconterDateValidation);
                    }}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                      color: "primary"
                    }}
                  />
                </MuiPickersUtilsProvider>
              </ProgramEncounterForm>
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
  programEncounterForm: state.dataEntry.programEncounterReducer.programEncounterForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  programEncounter: state.dataEntry.programEncounterReducer.programEncounter,
  enconterDateValidation: state.dataEntry.programEncounterReducer.enconterDateValidation
});

const mapDispatchToProps = {
  onLoad,
  updateProgramEncounter,
  setEncounterDateValidation,
  editProgramEncounter,
  resetState,
  createProgramEncounter,
  createProgramEncounterForScheduled
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEncounter)
  )
);
