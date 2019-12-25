import React, { Fragment, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import ProfileDetails from "./components/ProfileDetails";
import SubjectDashboardTabs from "./components/SubjectDashboardTabs";
import { getSubjectProfile } from "../../reducers/subjectDashboardReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(4),
    flexGrow: 1
  }
}));

const SubjectDashboard = ({ match, getSubjectProfile, subjectProfile }) => {
  const classes = useStyles();
  let paperInfo;
  if(subjectProfile != undefined){
    paperInfo = (<Paper className={classes.root}>
      <ProfileDetails profileDetails={subjectProfile} />
      <SubjectDashboardTabs profile={subjectProfile} />
    </Paper>)
  }

  useEffect(() => {
    getSubjectProfile(match.queryParams.uuid);
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      {paperInfo}
    </Fragment>
  );
};

const mapStateToProps = state => ({
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile
});

const mapDispatchToProps = {
  getSubjectProfile
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SubjectDashboard)
  )
);
