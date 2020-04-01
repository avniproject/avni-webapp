import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import SubjectButton from "./Button";
import { getEnrolForm } from "../../../reducers/programEnrolReducer";
import Form from "../../../components/Form";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
import enrolmentReducer from "dataEntryApp/reducers/programEnrolReducer";
import ProgramEnrolmentForm from "./ProgramEnrolmentForm";

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
  }
}));

const ProgramEnrol = ({ match, getEnrolForm, enrolForm, getSubjectProfile, subjectProfile }) => {
  const [value, setValue] = React.useState("Yes");

  const handleChange = event => {
    setValue(event.target.value);
  };
  const classes = useStyles();

  useEffect(() => {
    getEnrolForm("Individual", match.queryParams.programName);
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
              <p
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
                    <span style={{ color: "black" }}>{subjectProfile.gender}</span>{" "}
                    &nbsp;&nbsp;|&nbsp;&nbsp; Village:{" "}
                    <span style={{ color: "black" }}>{subjectProfile.lowestAddressLevel}</span>
                    {/* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; GPS Coordinates:{" "}
                        <span style={{ color: "black" }}>15.3657699, 73.9327478</span> */}
                    &nbsp;&nbsp;|&nbsp;&nbsp; Enrolment details:{" "}
                    <span style={{ color: "black" }}>29-01-2020</span>
                  </span>
                ) : (
                  ""
                )}
              </p>
              {enrolForm ? <ProgramEnrolmentForm /> : <div>Loading</div>}
            </Grid>
          </Grid>
        </div>
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  enrolForm: state.dataEntry.enrolmentReducer.enrolForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile
});

const mapDispatchToProps = {
  getEnrolForm,
  getSubjectProfile
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEnrol)
  )
);
