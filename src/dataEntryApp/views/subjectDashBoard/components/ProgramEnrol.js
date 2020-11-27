import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {
  onLoad,
  updateProgramEnrolDate,
  updateProgramExitDate,
  setProgramEnrolment,
  setInitialState,
  setEnrolDateValidation,
  fetchEnrolmentRulesResponse
} from "dataEntryApp/reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
import ProgramEnrolmentForm from "./ProgramEnrolmentForm";
import ProgramExitEnrolmentForm from "./ProgramExitEnrolmentForm";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { dateFormat } from "dataEntryApp/constants";

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

const ProgramEnrol = ({
  match,
  onLoad,
  enrolForm,
  getSubjectProfile,
  programEnrolment,
  updateProgramEnrolDate,
  updateProgramExitDate,
  setInitialState,
  setEnrolDateValidation,
  enrolDateValidation,
  load
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const formType = match.queryParams.formType;
  const subjectTypeName = match.queryParams.subjectTypeName;
  useEffect(() => {
    onLoad(
      subjectTypeName,
      match.queryParams.programName,
      formType,
      match.queryParams.programEnrolmentUuid,
      match.queryParams.uuid
    );
  }, []);

  return load ? (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.tableView}>
          <Typography component={"span"} className={classes.mainHeading}>
            {match.queryParams.programName}
          </Typography>
          <Grid justify="center" alignItems="center" container spacing={3}>
            <Grid item xs={12}>
              {enrolForm && programEnrolment && formType === "ProgramEnrolment" ? (
                <ProgramEnrolmentForm
                  formType={formType}
                  fetchRulesResponse={fetchEnrolmentRulesResponse}
                >
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography
                      variant="body1"
                      gutterBottom
                      style={{ width: "50%", marginBottom: 10, color: "rgba(0, 0, 0, 0.54)" }}
                    >
                      Enrolment Date*
                    </Typography>
                    <KeyboardDatePicker
                      style={{ width: "30%" }}
                      margin="none"
                      size="small"
                      id="date-picker-dialog"
                      format={dateFormat}
                      placeholder={dateFormat}
                      name="enrolmentDateTime"
                      value={programEnrolment.enrolmentDateTime}
                      autoComplete="off"
                      required
                      error={enrolDateValidation && !enrolDateValidation.success}
                      helperText={
                        enrolDateValidation &&
                        !enrolDateValidation.success &&
                        t(enrolDateValidation.messageKey)
                      }
                      onChange={updateProgramEnrolDate}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </ProgramEnrolmentForm>
              ) : enrolForm && programEnrolment && formType === "ProgramExit" ? (
                <ProgramExitEnrolmentForm
                  formType={formType}
                  fetchRulesResponse={fetchEnrolmentRulesResponse}
                >
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography
                      variant="body1"
                      gutterBottom
                      style={{ width: "50%", marginBottom: 10, color: "rgba(0, 0, 0, 0.54)" }}
                    >
                      Exit Enrolment Date*
                    </Typography>
                    <KeyboardDatePicker
                      style={{ width: "30%" }}
                      margin="none"
                      size="small"
                      id="date-picker-dialog"
                      format={dateFormat}
                      placeholder={dateFormat}
                      name="programExitDateTime"
                      value={programEnrolment.programExitDateTime}
                      autoComplete="off"
                      required
                      error={enrolDateValidation && !enrolDateValidation.success}
                      helperText={
                        enrolDateValidation &&
                        !enrolDateValidation.success &&
                        t(enrolDateValidation.messageKey)
                      }
                      onChange={updateProgramExitDate}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </ProgramExitEnrolmentForm>
              ) : (
                <div>Loading</div>
              )}
            </Grid>
          </Grid>
        </div>
      </Paper>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={load} />
  );
};

const mapStateToProps = state => ({
  enrolForm: state.dataEntry.enrolmentReducer.enrolForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  programEnrolment: state.dataEntry.enrolmentReducer.programEnrolment,
  enrolDateValidation: state.dataEntry.enrolmentReducer.enrolDateValidation,
  load: state.dataEntry.enrolmentReducer.load
});

const mapDispatchToProps = {
  onLoad,
  getSubjectProfile,
  updateProgramEnrolDate,
  updateProgramExitDate,
  setProgramEnrolment,
  setInitialState,
  setEnrolDateValidation
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEnrol)
  )
);
