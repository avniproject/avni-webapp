import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { onLoad, updateProgramEnrolment } from "../../../reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
import ProgramEnrolmentForm from "./ProgramEnrolmentForm";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import { TextField } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
    display: "inline"
  }
}));

const ProgramEnrol = ({
  match,
  onLoad,
  enrolForm,
  getSubjectProfile,
  subjectProfile,
  programEnrolment,
  updateProgramEnrolment
}) => {
  const [value, setValue] = React.useState("Yes");

  const { t } = useTranslation();

  const handleChange = event => {
    setValue(event.target.value);
  };
  const classes = useStyles();

  if (programEnrolment && programEnrolment.enrolmentDateTime) {
    const enrolmentDate = new Date(programEnrolment.enrolmentDateTime);

    const enrolmentFullDate =
      enrolmentDate.getFullYear() + "-" + enrolmentDate.getMonth() + "-" + enrolmentDate.getDate();

    console.log("Enrolment date..");
    console.log(
      enrolmentDate.getFullYear() + "-" + enrolmentDate.getMonth() + "-" + enrolmentDate.getDate()
    );
  }

  useEffect(() => {
    onLoad("Individual", match.queryParams.programName);
    getSubjectProfile(match.queryParams.uuid);
  }, []);

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
              {/* <p
                style={{
                  padding: "9px",
                  backgroundColor: "#F8F9F9",
                  color: "gray",
                  marginTop: "20px",
                  fontSize: "12px"
                }}
              >
                {subjectProfile ? (
                  <span>
                    Name:{" "}
                    <span style={{ color: "black" }}>
                      {subjectProfile.firstName} {subjectProfile.lastName}
                    </span>{" "}
                    &nbsp;&nbsp;|&nbsp;&nbsp; Age:{" "}
                    <span style={{ color: "black" }}>
                      {subjectProfile.getAge()._durationValue}{" "}
                      {subjectProfile.getAge().durationUnit}
                    </span>{" "}
                    &nbsp;&nbsp;|&nbsp;&nbsp; Gender:{" "}
                    <span style={{ color: "black" }}>{subjectProfile.gender.name}</span>{" "}
                    &nbsp;&nbsp;|&nbsp;&nbsp; Village:{" "}
                    <span style={{ color: "black" }}>{subjectProfile.lowestAddressLevel}</span>
                  
                    &nbsp;&nbsp;|&nbsp;&nbsp; Enrolment details:{" "}
                    <span style={{ color: "black" }}>29-01-2020</span>
                  </span>
                ) : (
                  ""
                )}
              </p> */}
              {enrolForm && programEnrolment && programEnrolment.enrolmentDateTime ? (
                <ProgramEnrolmentForm>
                  Enrolment Date :
                  {/* <form className={classes.container} noValidate>
                  <TextField
                    id="date-picker-dialog"
                    type="date"
                    name="enrolmentDateTime"
                    defaultValue={new Date(programEnrolment.enrolmentDateTime).getFullYear() + "-" + new Date(programEnrolment.enrolmentDateTime).getMonth() + "-" + new Date(programEnrolment.enrolmentDateTime).getDate()}
                    className={classes.textField}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={date => {
                      updateProgramEnrolment("enrolmentDateTime", new Date(date));
                    }}
                  />
                </form> */}
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      style={{ width: "13%" }}
                      margin="none"
                      size="small"
                      id="date-picker-dialog"
                      variant="inline"
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
                      keyboardIcon={<ExpandMoreIcon />}
                    />
                  </MuiPickersUtilsProvider>
                </ProgramEnrolmentForm>
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
  programEnrolment: state.dataEntry.enrolmentReducer.programEnrolment
});

const mapDispatchToProps = {
  onLoad,
  getSubjectProfile,
  updateProgramEnrolment
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEnrol)
  )
);
