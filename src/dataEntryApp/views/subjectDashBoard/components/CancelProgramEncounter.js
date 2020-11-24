import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Typography } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { isNil, isEqual, isEmpty, first } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  updateProgramEncounter,
  setEncounterDateValidation,
  resetState,
  createCancelProgramEncounter,
  editCancelProgramEncounter,
  fetchProgramEncounterRulesResponse
} from "../../../reducers/programEncounterReducer";
import CancelProgramEncounterForm from "./CancelProgramEncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import programEncounterService from "../../../services/ProgramEncounterService";
import { dateFormat } from "dataEntryApp/constants";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const CancelProgramEncounter = ({ match, programEncounter, enconterDateValidation, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const editCancelProgramEncounter = isEqual(match.path, "/app/subject/editCancelProgramEncounter");
  const encounterUuid = match.queryParams.uuid;

  useEffect(() => {
    props.resetState();
    if (editCancelProgramEncounter) {
      props.editCancelProgramEncounter(encounterUuid);
    } else {
      props.createCancelProgramEncounter(encounterUuid);
    }
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Grid justify="center" alignItems="center" container spacing={3}>
          <Grid item xs={12}>
            {props.cancelProgramEncounterForm && programEncounter && props.subjectProfile ? (
              <CancelProgramEncounterForm fetchRulesResponse={fetchProgramEncounterRulesResponse}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Typography
                    variant="body1"
                    gutterBottom
                    style={{ width: "50%", marginBottom: 10, color: "rgba(0, 0, 0, 0.54)" }}
                  >
                    Cancel Date
                  </Typography>
                  <KeyboardDatePicker
                    style={{ width: "30%" }}
                    margin="none"
                    size="small"
                    id="date-picker-dialog"
                    format={dateFormat}
                    placeholder={dateFormat}
                    name="cancelDateTime"
                    autoComplete="off"
                    required
                    value={new Date(programEncounter.cancelDateTime)}
                    error={
                      !isEmpty(enconterDateValidation) && !first(enconterDateValidation).success
                    }
                    helperText={
                      !isEmpty(enconterDateValidation) &&
                      t(first(enconterDateValidation).messageKey)
                    }
                    onChange={date => {
                      const cancelDate = isNil(date) ? undefined : new Date(date);
                      programEncounter.cancelDateTime = cancelDate;
                      props.updateProgramEncounter("cancelDateTime", cancelDate);
                      props.setEncounterDateValidation([
                        programEncounterService.validateCancelDate(programEncounter)
                      ]);
                    }}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                      color: "primary"
                    }}
                  />
                </MuiPickersUtilsProvider>
              </CancelProgramEncounterForm>
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
  cancelProgramEncounterForm: state.dataEntry.programEncounterReducer.programEncounterForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  programEncounter: state.dataEntry.programEncounterReducer.programEncounter,
  enconterDateValidation: state.dataEntry.programEncounterReducer.enconterDateValidation
});

const mapDispatchToProps = {
  updateProgramEncounter,
  setEncounterDateValidation,
  createCancelProgramEncounter,
  editCancelProgramEncounter,
  resetState
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CancelProgramEncounter)
  )
);
