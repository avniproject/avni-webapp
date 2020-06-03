import React, { Fragment, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import ProfileDetails from "./components/ProfileDetails";
import SubjectDashboardTabs from "./components/SubjectDashboardTabs";
import { getSubjectProfile } from "../../reducers/subjectDashboardReducer";
import { getSubjectGeneral } from "../../reducers/generalSubjectDashboardReducer";
import { getSubjectProgram } from "../../reducers/programSubjectDashboardReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const SubjectDashboard = ({
  match,
  getSubjectProfile,
  subjectProfile,
  getSubjectGeneral,
  subjectGeneral,
  getSubjectProgram,
  subjectProgram,
  enableReadOnly,
  load
}) => {
  const classes = useStyles();
  let paperInfo;
  if (subjectProfile !== undefined) {
    paperInfo = (
      <Paper className={classes.root}>
        <ProfileDetails
          profileDetails={subjectProfile}
          subjectUuid={match.queryParams.uuid}
          enableReadOnly={enableReadOnly}
        />
        <SubjectDashboardTabs
          profile={subjectProfile}
          general={subjectGeneral}
          program={subjectProgram}
          enableReadOnly={enableReadOnly}
        />
      </Paper>
    );
  }

  useEffect(() => {
    getSubjectProfile(match.queryParams.uuid);
    getSubjectGeneral(match.queryParams.uuid);
    getSubjectProgram(match.queryParams.uuid);
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      {paperInfo}
      <CustomizedBackdrop load={load} />
    </Fragment>
  );
};

const mapStateToProps = state => ({
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  subjectGeneral: state.dataEntry.subjectGenerel.subjectGeneral,
  subjectProgram: state.dataEntry.subjectProgram.subjectProgram,
  enableReadOnly: state.app.userInfo.settings.dataEntryAppReadonly,
  load: state.dataEntry.loadReducer.load
});

const mapDispatchToProps = {
  getSubjectProfile,
  getSubjectGeneral,
  getSubjectProgram
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SubjectDashboard)
  )
);
