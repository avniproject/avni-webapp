import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { remove, isNil } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  getProgramEncounterForm,
  getProgramEncounterTypes,
  setProgramEncounter,
  saveProgramEncounterComplete,
  updateProgramEncounter,
  setEncounterDateValidation
} from "../../../reducers/programEncounterReducer";
import ProgramEncounterForm from "./ProgramEncounterForm";

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

const ProgramEncounter = ({ match, programEncounter, enconterDateValidation, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const enrolmentUuid = match.queryParams.enrolUuid;
  const encounterTypeUuid = match.queryParams.uuid;

  useEffect(() => {
    props.setProgramEncounter();
    props.saveProgramEncounterComplete(false);
    (async function fetchData() {
      await props.getProgramEncounterTypes(enrolmentUuid);
      props.getProgramEncounterForm(encounterTypeUuid, enrolmentUuid);
    })();
  }, []);

  // console.log("Inside new page >> programEncounter ..printing states");
  // console.log(props.x);

  const validationResultForEncounterDate =
    enconterDateValidation &&
    enconterDateValidation.find(vr => !vr.success && vr.formIdentifier === "ENCOUNTER_DATE_TIME");
  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.tableView}>
          <Grid justify="center" alignItems="center" container spacing={3}>
            <Grid item xs={12}>
              {props.programEncounterForm && programEncounter && props.subjectProfile ? (
                <ProgramEncounterForm>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      style={{ width: "30%" }}
                      label="Visit Date"
                      margin="none"
                      size="small"
                      id="date-picker-dialog"
                      format="MM/dd/yyyy"
                      name="visitDateTime"
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
                          vr => vr.formIdentifier === "ENCOUNTER_DATE_TIME"
                        );
                        const result = programEncounter
                          .validate()
                          .find(vr => !vr.success && vr.formIdentifier === "ENCOUNTER_DATE_TIME");
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
  programEncounterForm: state.dataEntry.programEncounterReducer.programEncounterForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  programEncounter: state.dataEntry.programEncounterReducer.programEncounter,
  enconterDateValidation: state.dataEntry.programEncounterReducer.enconterDateValidation,
  x: state
});

const mapDispatchToProps = {
  getProgramEncounterForm,
  getProgramEncounterTypes,
  setProgramEncounter,
  saveProgramEncounterComplete,
  updateProgramEncounter,
  setEncounterDateValidation
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEncounter)
  )
);
