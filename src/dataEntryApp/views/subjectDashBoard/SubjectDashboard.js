import React, { Fragment, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import ProfileDetails from "./components/ProfileDetails";
import SubjectDashboardTabs from "./components/SubjectDashboardTabs";
import {
  getSubjectProfile,
  unVoidSubject,
  voidSubject
} from "../../reducers/subjectDashboardReducer";
import { getSubjectGeneral } from "../../reducers/generalSubjectDashboardReducer";
import { getSubjectProgram } from "../../reducers/programSubjectDashboardReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";
import { selectEnableReadonly } from "dataEntryApp/sagas/selectors";

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
  voidSubject,
  unVoidSubject,
  load,
  registrationForm
}) => {
  const classes = useStyles();
  let paperInfo;

  const handleUpdateComponent = () => {
    (async function fetchData() {
      await setTimeout(() => {
        getSubjectProgram(match.queryParams.uuid);
      }, 500);
    })();
  };

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
          handleUpdateComponent={handleUpdateComponent}
          enableReadOnly={enableReadOnly}
          voidSubject={voidSubject}
          unVoidSubject={unVoidSubject}
          registrationForm={registrationForm}
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
  enableReadOnly: selectEnableReadonly(state),
  load: state.dataEntry.loadReducer.load,
  registrationForm: state.dataEntry.registration.registrationForm
});

const mapDispatchToProps = {
  getSubjectProfile,
  getSubjectGeneral,
  getSubjectProgram,
  voidSubject,
  unVoidSubject
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SubjectDashboard)
  )
);
