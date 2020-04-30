import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {
  getProgramEncounterForm,
  getProgramEnrolment
  //getProgramEncounter
} from "../../../reducers/programReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
import ProgramEncounterForm from "./ProgramEncounterForm";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";

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
  ...props
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const enrolmentUuid = match.queryParams.enrolUuid;
  const encounterTypeUuid = match.queryParams.uuid;
  useEffect(() => {
    getProgramEncounterForm(encounterTypeUuid, enrolmentUuid);
    //For Planned Encounters List : To get list of ProgramEncounters from api
    getProgramEnrolment(enrolmentUuid);
    //For Unplanned Encounters List : To get possible encounters from FormMapping
    // Using form type as "ProgramEncounter", program uuid, subject type uuid
    //getProgramEncounter("Individual", programUuid);
  }, []);
  console.log("Inside new page >> programEncounter ..printing states");
  console.log(props.x);
  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.tableView}>
          <Grid justify="center" alignItems="center" container spacing={3}>
            <Grid item xs={12}>
              {/* {enrolForm && programEnrolment && programEnrolment.enrolmentDateTime ? ( */}
              {programEncounterForm ? (
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
                      value={new Date()}
                      // value={new Date(programEnrolment.enrolmentDateTime)}
                      onChange={date => {
                        //updateProgramEnrolment("enrolmentDateTime", new Date(date));
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
  //programEncounterForm: state.dataEntry.programReducer.programEncounterForm
  programEncounterForm: state.programs.programEncounterForm,
  plannedEncounters: state.programs.programEnrolment,
  x: state
  //subject: state.dataEntry.subjectProfile.subjectProfile,
  // programEncounter: state.programs.programEncounter
});

const mapDispatchToProps = {
  getProgramEncounterForm,
  getProgramEnrolment
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEncounter)
  )
);
