import { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SubjectSearch from "./views/search/SubjectSearch";
import SubjectRegister from "./views/registration/SubjectRegister";
import {
  getLegacyRules,
  getLegacyRulesBundle,
  getOperationalModules,
  selectLegacyRulesBundleLoaded,
  selectLegacyRulesLoaded
} from "dataEntryApp/reducers/metadataReducer";
import { getOrgConfigInfo } from "i18nTranslations/TranslationReducers";
import Loading from "./components/Loading";
import SubjectDashboard from "./views/subjectDashBoard/SubjectDashboard";
import ProgramEnrol from "./views/subjectDashBoard/components/ProgramEnrol";
import ViewVisit from "./views/subjectDashBoard/components/ViewVisit";
import AddRelative from "./views/subjectDashBoard/components/AddRelative";
import NewProgramVisit from "./views/subjectDashBoard/components/NewProgramVisit";
import ProgramEncounter from "./views/subjectDashBoard/components/ProgramEncounter";
import CancelProgramEncounter from "./views/subjectDashBoard/components/CancelProgramEncounter";
import NewGeneralVisit from "./views/subjectDashBoard/components/NewGeneralVisit";
import SearchFilterFormContainer from "./views/GlobalSearch/SearchFilterForm";
import Encounter from "./views/subjectDashBoard/components/Encounter";
import CancelEncounter from "./views/subjectDashBoard/components/CancelEncounter";
import AppBar from "dataEntryApp/components/AppBar";
import GroupMembershipAddEdit from "./components/GroupMembershipAddEdit";
import { Grid } from "@mui/material";
import i18n from "i18next";
import { I18nextProvider } from "react-i18next";
import { NewsList } from "./views/subjectDashBoard/components/news/NewsList";
import NewsDetails from "./views/subjectDashBoard/components/news/NewsDetails";
import Player from "./views/audio/Player";

const StyledRoot = styled("div")({
  flexGrow: 1
});

const StyledGrid = styled(Grid)({
  justifyContent: "center"
});

const DataEntry = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const operationalModules = useSelector(state => state.dataEntry.metadata.operationalModules);
  const orgConfig = useSelector(state => state.translationsReducer.orgConfig);
  const legacyRulesBundleLoaded = useSelector(selectLegacyRulesBundleLoaded);
  const legacyRulesLoaded = useSelector(selectLegacyRulesLoaded);

  const loadApp = operationalModules && orgConfig && legacyRulesBundleLoaded && legacyRulesLoaded;

  const path =
    location.pathname
      .split("/")
      .slice(0, -1)
      .join("/") || "";
  useEffect(() => {
    dispatch(getOperationalModules());
    dispatch(getOrgConfigInfo());
    dispatch(getLegacyRulesBundle());
    dispatch(getLegacyRules());
  }, [dispatch]);

  return (
    <StyledRoot>
      {loadApp ? (
        <I18nextProvider i18n={i18n}>
          <StyledGrid container>
            <Grid size={12}>
              <AppBar />
            </Grid>
            <Grid size={12}>
              <Routes>
                <Route path={path} element={<SearchFilterFormContainer />} />
                <Route path={`${path}/searchFilter`} element={<SearchFilterFormContainer />} />
                <Route path={`${path}/search`} element={<SubjectSearch />} />
                <Route path={`${path}/register`} element={<SubjectRegister />} />
                <Route path={`${path}/editSubject`} element={<SubjectRegister />} />
                <Route path={`${path}/subject`} element={<SubjectDashboard />} />
                <Route path={`${path}/subject/subjectProfile`} element={<SubjectDashboard tab={1} />} />
                <Route path={`${path}/subject/enrol`} element={<ProgramEnrol />} />
                <Route path={`${path}/subject/viewProgramEncounter`} element={<ViewVisit />} />
                <Route path={`${path}/subject/viewEncounter`} element={<ViewVisit />} />
                <Route path={`${path}/subject/addRelative`} element={<AddRelative />} />
                <Route path={`${path}/subject/addGroupMember`} element={<GroupMembershipAddEdit />} />
                <Route path={`${path}/subject/editGroupMembership`} element={<GroupMembershipAddEdit />} />
                <Route path={`${path}/subject/newProgramVisit`} element={<NewProgramVisit />} />
                <Route path={`${path}/subject/programEncounter`} element={<ProgramEncounter />} />
                <Route path={`${path}/subject/editProgramEncounter`} element={<ProgramEncounter />} />
                <Route path={`${path}/subject/cancelProgramEncounter`} element={<CancelProgramEncounter />} />
                <Route path={`${path}/subject/editCancelProgramEncounter`} element={<CancelProgramEncounter />} />
                <Route path={`${path}/subject/newGeneralVisit`} element={<NewGeneralVisit />} />
                <Route path={`${path}/subject/encounter`} element={<Encounter />} />
                <Route path={`${path}/subject/editEncounter`} element={<Encounter />} />
                <Route path={`${path}/subject/cancelEncounter`} element={<CancelEncounter />} />
                <Route path={`${path}/subject/editCancelEncounter`} element={<CancelEncounter />} />
                <Route path={`${path}/news`} element={<NewsList />} />
                <Route path={`${path}/news/:id/details`} element={<NewsDetails />} />
                <Route path={`${path}/audio`} element={<Player />} />
              </Routes>
            </Grid>
          </StyledGrid>
        </I18nextProvider>
      ) : (
        <Loading />
      )}
    </StyledRoot>
  );
};

export default DataEntry;
