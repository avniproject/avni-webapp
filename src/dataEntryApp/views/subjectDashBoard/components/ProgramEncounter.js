import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {
  getProgramEncounterForm,
  getProgramEnrolment,
  getUnplanProgramEncounters,
  setProgramEncounter,
  saveProgramEncounterComplete,
  updateProgramEncounter,
  setValidationResults
} from "../../../reducers/programEncounterReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
import ProgramEncounterForm from "./ProgramEncounterForm";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
// import { ProgramEncounter } from "avni-models";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  mainHeading: {
    fontSize: "20px"
  },
  btnCustom: {
    //float:'left',
    backgroundColor: "#fc9153",
    height: "30px",
    marginRight: "20px"
  },
  container: {
    display: "inline",
    flexWrap: "wrap",
    fontSize: "13px"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
    display: "inline",
    fontSize: "13px"
  },
  input: {
    fontSize: "13px"
  }
}));

const ProgramEncounter = ({
  match,
  getProgramEncounterForm,
  getProgramEnrolment,
  programEncounterForm,
  programEncounter,
  getUnplanProgramEncounters,
  programEnrolment,
  setProgramEncounter,
  saveProgramEncounterComplete,
  updateProgramEncounter,
  validationResults,
  setValidationResults,
  ...props
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const enrolmentUuid = match.queryParams.enrolUuid;
  const encounterTypeUuid = match.queryParams.uuid;
  useEffect(() => {
    (async function fetchData() {
      setProgramEncounter();
      saveProgramEncounterComplete(false);
      //For Planned Encounters List : To get list of ProgramEncounters from api
      await getProgramEnrolment(enrolmentUuid);
      //For Unplanned Encounters List : To get possible encounters from FormMapping
      // Using form type as "ProgramEncounter", program uuid, subject type uuid
      await getUnplanProgramEncounters("Individual", programEnrolment.program.uuid);

      getProgramEncounterForm(encounterTypeUuid, enrolmentUuid);
    })();
  }, []);

  console.log("Inside new page >> programEncounter ..printing states");
  console.log(props.x);

  const validationResultForEncounterDate = validationResults.find(
    vr => !vr.success && vr.formIdentifier === "ENCOUNTER_DATE_TIME"
  );
  console.log("validationResultForEncounterDate", validationResultForEncounterDate);
  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.tableView}>
          <Grid justify="center" alignItems="center" container spacing={3}>
            <Grid item xs={12}>
              {/* {enrolForm && programEnrolment && programEnrolment.enrolmentDateTime ? ( */}
              {programEncounterForm && programEncounter ? (
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
                      // error={!_.isEmpty(subjectRegErrors.REGISTRATION_DATE)}
                      // helperText={t(subjectRegErrors.REGISTRATION_DATE)}
                      // value={new Date(programEnrolment.enrolmentDateTime)}
                      onChange={date => {
                        updateProgramEncounter("encounterDateTime", new Date(date));
                        programEncounter.encounterDateTime = date;
                        validationResults.push(programEncounter.validate()[1]);
                        //console.log(validationResults.push(programEncounter.validate()[1]));
                        setValidationResults(validationResults);
                        console.log("validationResults", validationResults);
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
  programEnrolment: state.dataEntry.programEncounterReducer.programEnrolment,
  unplannedEncounters: state.dataEntry.programEncounterReducer.unplanProgramEncounters,
  x: state,
  //subject: state.dataEntry.subjectProfile.subjectProfile,
  programEncounter: state.dataEntry.programEncounterReducer.programEncounter,
  validationResults: state.dataEntry.programEncounterReducer.validationResults
});

const mapDispatchToProps = {
  getProgramEncounterForm,
  getProgramEnrolment,
  getUnplanProgramEncounters,
  setProgramEncounter,
  saveProgramEncounterComplete,
  updateProgramEncounter,
  setValidationResults
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEncounter)
  )
);
