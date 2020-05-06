import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import _ from "lodash";
import {
  getProgramEncounterForm,
  getProgramEnrolment,
  getUnplanProgramEncounters,
  setProgramEncounter,
  saveProgramEncounterComplete,
  updateProgramEncounter,
  setEncounterDateValidation
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
  setEncounterDateValidation,
  enconterDateValidation,
  getSubjectProfile,
  subjectProfile,
  ...props
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const enrolmentUuid = match.queryParams.enrolUuid;
  const encounterTypeUuid = match.queryParams.uuid;
  useEffect(() => {
    setProgramEncounter();
    saveProgramEncounterComplete(false);
    (async function fetchData() {
      //For Planned Encounters List : To get list of ProgramEncounters from api
      await getProgramEnrolment(enrolmentUuid);
      //getSubjectProfile(programEnrolment.subjectUuid);
      console.log("programEnrolment from async", programEnrolment);
      //For Unplanned Encounters List : To get possible encounters from FormMapping
      // Using form type as "ProgramEncounter", program uuid, subject type uuid
      //   if (programEnrolment) {
      //      getUnplanProgramEncounters("Individual", programEnrolment.program.uuid);
      // }

      getProgramEncounterForm(encounterTypeUuid, enrolmentUuid);
    })();
  }, []);

  console.log("Inside new page >> programEncounter ..printing states");
  console.log(props.x);

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
              {/* {enrolForm && programEnrolment && programEnrolment.enrolmentDateTime ? ( */}
              {programEncounterForm && programEncounter && subjectProfile ? (
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
                        !_.isNil(validationResultForEncounterDate) &&
                        !validationResultForEncounterDate.success
                      }
                      helperText={
                        !_.isNil(validationResultForEncounterDate) &&
                        t(validationResultForEncounterDate.messageKey)
                      }
                      onChange={date => {
                        const visitDate = _.isNil(date) ? undefined : new Date(date);
                        updateProgramEncounter("encounterDateTime", new Date(visitDate));
                        programEncounter.encounterDateTime = visitDate;
                        _.remove(
                          enconterDateValidation,
                          vr => vr.formIdentifier === "ENCOUNTER_DATE_TIME"
                        );
                        const result = programEncounter
                          .validate()
                          .find(vr => !vr.success && vr.formIdentifier === "ENCOUNTER_DATE_TIME");
                        result
                          ? enconterDateValidation.push(result)
                          : enconterDateValidation.push(...programEncounter.validate());
                        setEncounterDateValidation(enconterDateValidation);
                        console.log("after", enconterDateValidation);
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
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  programEncounter: state.dataEntry.programEncounterReducer.programEncounter,
  enconterDateValidation: state.dataEntry.programEncounterReducer.enconterDateValidation,
  x: state
});

const mapDispatchToProps = {
  getProgramEncounterForm,
  getProgramEnrolment,
  getUnplanProgramEncounters,
  setProgramEncounter,
  saveProgramEncounterComplete,
  updateProgramEncounter,
  setEncounterDateValidation,
  getSubjectProfile
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEncounter)
  )
);
