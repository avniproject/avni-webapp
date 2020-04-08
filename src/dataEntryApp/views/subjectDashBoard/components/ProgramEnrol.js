import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { onLoad } from "../../../reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
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

const ProgramEnrol = ({
  match,
  onLoad,
  enrolForm,
  getSubjectProfile,
  subjectProfile,
  programEnrolment
}) => {
  const [value, setValue] = React.useState("Yes");

  const handleChange = event => {
    setValue(event.target.value);
  };
  const classes = useStyles();

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
              {enrolForm && programEnrolment ? <ProgramEnrolmentForm /> : <div>Loading</div>}
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
