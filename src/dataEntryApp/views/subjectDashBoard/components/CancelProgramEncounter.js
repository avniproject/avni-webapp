import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { remove, isNil, isEmpty } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { ModelGeneral as General, ValidationResult } from "avni-models";
import moment from "moment";
import {
  getCancelProgramEncounterForm,
  setProgramEncounter,
  saveProgramEncounterComplete,
  updateProgramEncounter,
  setEncounterDateValidation
  // onLoadEditProgramEncounter
} from "../../../reducers/programEncounterReducer";
import CancelProgramEncounterForm from "./CancelProgramEncounterForm";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  mainHeading: {
    fontSize: "20px"
  },
  container: {
    display: "inline",
    flexWrap: "wrap",
    fontSize: "13px"
  }
}));

const CancelProgramEncounter = ({ match, programEncounter, enconterDateValidation, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  //   const editProgramEncounter = isEqual(match.path, "/app/subject/editProgramEncounter");
  const enrolUuid = match.queryParams.enrolUuid;
  const uuid = match.queryParams.uuid;
  const CANCEL_DATE_TIME = "CANCEL_DATE_TIME";
  // console.log("All props..cancelPE", props.x);
  useEffect(() => {
    props.setProgramEncounter();
    props.saveProgramEncounterComplete(false);
    props.getCancelProgramEncounterForm(uuid, enrolUuid);
    (async function fetchData() {
      // if (editProgramEncounter) {
      //uuid - encounterTypeUuid
      // } else {
      //uuid - encounterUuid
      //await props.getCancelProgramEncounterForm(uuid, enrolUuid);
      //await props.onLoad(enrolUuid);
      // props.getProgramEncounterForm(uuid, enrolUuid);
      //  }
    })();
  }, []);

  const validateCancelDate = cancelDateTime => {
    const failure = new ValidationResult(false, CANCEL_DATE_TIME);
    if (isNil(cancelDateTime)) failure.messageKey = "emptyValidationMessage";
    else if (
      General.dateAIsBeforeB(cancelDateTime, programEncounter.programEnrolment.enrolmentDateTime) ||
      General.dateAIsAfterB(cancelDateTime, programEncounter.programEnrolment.programExitDateTime)
    )
      failure.messageKey = "cancelDateNotInBetweenEnrolmentAndExitDate";
    else if (General.dateIsAfterToday(cancelDateTime)) failure.messageKey = "cancelDateInFuture";
    else if (!moment(cancelDateTime).isValid()) {
      failure.messageKey = "invalidDateFormat";
    } else {
      return new ValidationResult(true, CANCEL_DATE_TIME, null);
    }
    return failure;
  };
  const validationResultForCancelDate =
    enconterDateValidation &&
    enconterDateValidation.find(vr => !vr.success && vr.formIdentifier === CANCEL_DATE_TIME);
  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.tableView}>
          <Grid justify="center" alignItems="center" container spacing={3}>
            <Grid item xs={12}>
              {props.cancelProgramEncounterForm && programEncounter && props.subjectProfile ? (
                <CancelProgramEncounterForm>
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
                      value={new Date(programEncounter.cancelDateTime)}
                      error={
                        !isNil(validationResultForCancelDate) &&
                        !validationResultForCancelDate.success
                      }
                      helperText={
                        !isNil(validationResultForCancelDate) &&
                        t(validationResultForCancelDate.messageKey)
                      }
                      onChange={date => {
                        const cancelDate = isNil(date) ? undefined : new Date(date);
                        props.updateProgramEncounter("cancelDateTime", cancelDate);
                        remove(
                          enconterDateValidation,
                          vr => vr.formIdentifier === CANCEL_DATE_TIME
                        );
                        enconterDateValidation.push(validateCancelDate(cancelDate));
                        props.setEncounterDateValidation(enconterDateValidation);
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </CancelProgramEncounterForm>
              ) : (
                <div>Loading</div>
              )}
            </Grid>
          </Grid>
        </div>
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  cancelProgramEncounterForm: state.dataEntry.programEncounterReducer.cancelProgramEncounterForm,
  x: state,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  programEncounter: state.dataEntry.programEncounterReducer.programEncounter,
  enconterDateValidation: state.dataEntry.programEncounterReducer.enconterDateValidation
});

const mapDispatchToProps = {
  setProgramEncounter,
  saveProgramEncounterComplete,
  updateProgramEncounter,
  setEncounterDateValidation,
  //   onLoadEditProgramEncounter
  getCancelProgramEncounterForm
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CancelProgramEncounter)
  )
);
