import { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Paper } from "@mui/material";
import { useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const SubjectDashboard = ({ tab }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get UUID from search params
  const uuid = searchParams.get("uuid");

  // Use modern Redux hooks
  const unVoidErrorKey = useSelector(state => state.dataEntry.subjectProfile.unVoidErrorKey);
  const subjectProfile = useSelector(state => state.dataEntry.subjectProfile.subjectProfile);
  const subjectGeneral = useSelector(state => state.dataEntry.subjectGenerel.subjectGeneral);
  const subjectProgram = useSelector(state => state.dataEntry.subjectProgram.subjectProgram);
  const load = useSelector(state => state.dataEntry.subjectProfile.dashboardLoaded);
  const registrationForm = useSelector(state => state.dataEntry.registration.registrationForm);
  const tabsStatus = useSelector(state => state.dataEntry.subjectProfile.tabsStatus);
  const groupMembers = useSelector(state => state.dataEntry.subjectProfile.groupMembers);
  const voidError = useSelector(state => state.dataEntry.subjectProfile.voidError);
  const msgs = useSelector(state => state.dataEntry.msgs);

  let paperInfo;

  const handleUpdateComponent = () => {
    (async function fetchData() {
      await setTimeout(() => {
        dispatch(getSubjectProgram(uuid));
      }, 500);
    })();
  };

  if (subjectProfile !== undefined) {
    paperInfo = (
      <StyledPaper elevation={2}>
        <ProfileDetails profileDetails={subjectProfile} subjectUuid={uuid} />
        <SubjectDashboardTabs
          unVoidErrorKey={unVoidErrorKey}
          profile={subjectProfile}
          general={subjectGeneral}
          program={subjectProgram}
          msgs={msgs}
          handleUpdateComponent={handleUpdateComponent}
          voidSubject={subjectUuid => dispatch(voidSubject(subjectUuid))}
          voidError={voidError}
          clearVoidServerError={() => dispatch(clearVoidServerError())}
          unVoidSubject={subjectUuid => dispatch(unVoidSubject(subjectUuid))}
          registrationForm={registrationForm}
          tab={tab}
          tabsStatus={tabsStatus}
          getGroupMembers={subjectUuid => dispatch(getGroupMembers(subjectUuid))}
          groupMembers={groupMembers}
        />
      </StyledPaper>
    );
  }

  useEffect(() => {
    if (uuid) {
      dispatch(loadSubjectDashboard(uuid));
    }
  }, [dispatch, uuid]);

  return (
    <Fragment>
      <Breadcrumbs path={location.pathname} />
      {paperInfo}
      <CustomizedBackdrop load={load} />
    </Fragment>
  );
};

export default SubjectDashboard;
