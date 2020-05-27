import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {
  onLoad,
  updateProgramEnrolment,
  setProgramEnrolment,
  setInitialState,
  setEnrolDateValidation
} from "../../../reducers/programEnrolReducer";
import { isNil, remove } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
import ProgramEnrolmentForm from "./ProgramEnrolmentForm";
import ProgramExitEnrolmentForm from "./ProgramExitEnrolmentForm";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
//import BrowserStore from "../../../api/browserStore";

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

const ProgramEnrol = ({
  match,
  onLoad,
  enrolForm,
  getSubjectProfile,
  programEnrolment,
  updateProgramEnrolment,
  setInitialState,
  setEnrolDateValidation,
  enrolDateValidation
  //setProgramEnrolment
}) => {
  const [value, setValue] = React.useState("Yes");

  const { t } = useTranslation();

  const ENROLMENT_DATE = "ENROLMENT_DATE";

  const handleChange = event => {
    setValue(event.target.value);
  };
  const classes = useStyles();
  const formType = match.queryParams.formType;

  useEffect(() => {
    (async function fetchData() {
      await setInitialState();
      await onLoad(
        "Individual",
        match.queryParams.programName,
        formType,
        match.queryParams.programEnrolmentUuid
      );
      await getSubjectProfile(match.queryParams.uuid);
    })();

    // onLoad(
    //   "Individual",
    //   match.queryParams.programName,
    //   formType,
    //   match.queryParams.programEnrolmentUuid
    // );
    // getSubjectProfile(match.queryParams.uuid);

    // (async function fetchData() {
    //   await onLoad("Individual", match.queryParams.programName, formType, match.queryParams.programEnrolmentUuid);
    //   getSubjectProfile(match.queryParams.uuid);

    //   // let programEnrolment = BrowserStore.fetchProgramEnrolment();
    //   // setProgramEnrolment(programEnrolment);
    // })();
  }, []);

  const validationResultForEnrolDate =
    enrolDateValidation &&
    enrolDateValidation.find(vr => !vr.success && vr.formIdentifier === ENROLMENT_DATE);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.tableView}>
          <Typography component={"span"} className={classes.mainHeading}>
            {match.queryParams.programName}
          </Typography>
          <Grid justify="center" alignItems="center" container spacing={3}>
            <Grid item xs={12}>
              {enrolForm &&
              programEnrolment &&
              programEnrolment.enrolmentDateTime &&
              formType === "ProgramEnrolment" ? (
                <ProgramEnrolmentForm formType={formType}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      style={{ width: "30%" }}
                      label="Enrolment Date"
                      margin="none"
                      size="small"
                      id="date-picker-dialog"
                      format="MM/dd/yyyy"
                      placeholder="mm/dd/yyyy"
                      name="enrolmentDateTime"
                      value={new Date(programEnrolment.enrolmentDateTime)}
                      autoComplete="off"
                      required
                      error={
                        !isNil(validationResultForEnrolDate) &&
                        !validationResultForEnrolDate.success
                      }
                      helperText={
                        !isNil(validationResultForEnrolDate) &&
                        t(validationResultForEnrolDate.messageKey)
                      }
                      onChange={date => {
                        const enrolDate = isNil(date) ? undefined : new Date(date);
                        updateProgramEnrolment("enrolmentDateTime", enrolDate);
                        programEnrolment.enrolmentDateTime = enrolDate;
                        remove(enrolDateValidation, vr => vr.formIdentifier === ENROLMENT_DATE);
                        const result = programEnrolment
                          .validateEnrolment()
                          .find(vr => !vr.success && vr.formIdentifier === ENROLMENT_DATE);
                        result
                          ? enrolDateValidation.push(result)
                          : enrolDateValidation.push(...programEnrolment.validateEnrolment());
                        setEnrolDateValidation(enrolDateValidation);
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </ProgramEnrolmentForm>
              ) : enrolForm && programEnrolment && programEnrolment.enrolmentDateTime ? (
                <ProgramExitEnrolmentForm formType={formType}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      style={{ width: "30%" }}
                      label="Exit Enrolment Date"
                      margin="none"
                      size="small"
                      id="date-picker-dialog"
                      format="MM/dd/yyyy"
                      name="enrolmentDateTime"
                      value={new Date(programEnrolment.enrolmentDateTime)}
                      onChange={date => {
                        updateProgramEnrolment("enrolmentDateTime", new Date(date));
                      }}
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
  );
};

const mapStateToProps = state => ({
  enrolForm: state.dataEntry.enrolmentReducer.enrolForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  programEnrolment: state.dataEntry.enrolmentReducer.programEnrolment,
  enrolDateValidation: state.dataEntry.enrolmentReducer.enrolDateValidation
});

const mapDispatchToProps = {
  onLoad,
  getSubjectProfile,
  updateProgramEnrolment,
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
