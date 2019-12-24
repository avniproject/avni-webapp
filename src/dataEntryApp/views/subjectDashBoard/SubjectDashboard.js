import React, { Fragment, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import ProfileDetails from "./components/ProfileDetails";
import SubjectDashboardTabs from "./components/SubjectDashboardTabs";
import { getSubjectProfile } from "../../reducers/subjectDashboardReducer";
import { getSubjectGeneral } from "../../reducers/generalSubjectDashboardReducer";
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

const SubjectDashboard = ({
  match,
  getSubjectProfile,
  subjectProfile,
  getSubjectGeneral,
  subjectGeneral
}) => {
  const classes = useStyles();

  useEffect(() => {
    getSubjectProfile(match.queryParams.uuid);
    getSubjectGeneral(match.queryParams.uuid);
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <ProfileDetails />
        <SubjectDashboardTabs profile={subjectProfile} general={subjectGeneral} />
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  subjectGeneral: state.dataEntry.subjectGenerel.subjectGeneral
});

const mapDispatchToProps = {
  getSubjectProfile,
  getSubjectGeneral
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SubjectDashboard)
  )
);
