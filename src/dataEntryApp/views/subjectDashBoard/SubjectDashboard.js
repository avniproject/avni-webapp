import React, { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Paper } from "@mui/material";
import ProfileDetails from "./components/ProfileDetails";
import SubjectDashboardTabs from "./components/SubjectDashboardTabs";
import {
  unVoidSubject,
  voidSubject,
  getGroupMembers,
  clearVoidServerError,
  loadSubjectDashboard
} from "../../reducers/subjectDashboardReducer";
import { getSubjectProgram } from "../../reducers/programSubjectDashboardReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const SubjectDashboard = ({
  match,
  loadSubjectDashboard,
  subjectProfile,
  subjectGeneral,
  getSubjectProgram,
  subjectProgram,
  msgs,
  voidSubject,
  unVoidSubject,
  load,
  registrationForm,
  tab,
  tabsStatus,
  getGroupMembers,
  groupMembers,
  voidError,
  clearVoidServerError,
  unVoidErrorKey
}) => {
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
      <StyledPaper elevation={2}>
        <ProfileDetails profileDetails={subjectProfile} subjectUuid={match.queryParams.uuid} />
        <SubjectDashboardTabs
          unVoidErrorKey={unVoidErrorKey}
          profile={subjectProfile}
          general={subjectGeneral}
          program={subjectProgram}
          msgs={msgs}
          handleUpdateComponent={handleUpdateComponent}
          voidSubject={voidSubject}
          voidError={voidError}
          clearVoidServerError={clearVoidServerError}
          unVoidSubject={unVoidSubject}
          registrationForm={registrationForm}
          tab={tab}
          tabsStatus={tabsStatus}
          getGroupMembers={getGroupMembers}
          groupMembers={groupMembers}
        />
      </StyledPaper>
    );
  }

  useEffect(() => {
    loadSubjectDashboard(match.queryParams.uuid);
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
  unVoidErrorKey: state.dataEntry.subjectProfile.unVoidErrorKey,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  subjectGeneral: state.dataEntry.subjectGenerel.subjectGeneral,
  subjectProgram: state.dataEntry.subjectProgram.subjectProgram,
  load: state.dataEntry.subjectProfile.dashboardLoaded,
  registrationForm: state.dataEntry.registration.registrationForm,
  tabsStatus: state.dataEntry.subjectProfile.tabsStatus,
  groupMembers: state.dataEntry.subjectProfile.groupMembers,
  voidError: state.dataEntry.subjectProfile.voidError,
  msgs: state.dataEntry.msgs
});

const mapDispatchToProps = {
  getSubjectProgram,
  getGroupMembers,
  voidSubject,
  unVoidSubject,
  clearVoidServerError,
  loadSubjectDashboard
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SubjectDashboard)
  )
);
