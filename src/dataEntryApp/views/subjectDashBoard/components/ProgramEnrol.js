import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {
  onLoad,
  updateProgramEnrolment,
  setProgramEnrolment
} from "../../../reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
import ProgramEnrolmentForm from "./ProgramEnrolmentForm";
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
  updateProgramEnrolment
  //setProgramEnrolment
}) => {
  const [value, setValue] = React.useState("Yes");

  const { t } = useTranslation();

  const handleChange = event => {
    setValue(event.target.value);
  };
  const classes = useStyles();

  useEffect(() => {
    //onLoad("Individual", match.queryParams.programName);
    //getSubjectProfile(match.queryParams.uuid);

    (async function fetchData() {
      await onLoad("Individual", match.queryParams.programName);
      getSubjectProfile(match.queryParams.uuid);

      // let programEnrolment = BrowserStore.fetchProgramEnrolment();
      // setProgramEnrolment(programEnrolment);
    })();
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
              {enrolForm && programEnrolment && programEnrolment.enrolmentDateTime ? (
                <ProgramEnrolmentForm>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      style={{ width: "30%" }}
                      label="Enrolment Date"
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
  updateProgramEnrolment,
  setProgramEnrolment
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEnrol)
  )
);
