import React, { useEffect } from "react";
import { Route, withRouter } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
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
import { makeStyles } from "@mui/styles";
import { Grid } from "@mui/material";
import i18n from "i18next";
import { I18nextProvider } from "react-i18next";
import { NewsList } from "./views/subjectDashBoard/components/news/NewsList";
import NewsDetails from "./views/subjectDashBoard/components/news/NewsDetails";
import Player from "./views/audio/Player";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  }
}));

const DataEntry = ({ match: { path }, operationalModules, orgConfig }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const legacyRulesBundleLoaded = useSelector(selectLegacyRulesBundleLoaded);
  const legacyRulesLoaded = useSelector(selectLegacyRulesLoaded);
  const loadApp = operationalModules && orgConfig && legacyRulesBundleLoaded && legacyRulesLoaded;
  useEffect(() => {
    dispatch(getOperationalModules());
    dispatch(getOrgConfigInfo());
    dispatch(getLegacyRulesBundle());
    dispatch(getLegacyRules());
  }, []);

  return (
    <div>
      {loadApp ? (
        <I18nextProvider i18n={i18n}>
          <div className={classes.root}>
            <Grid
              container
              sx={{
                justifyContent: "center"
              }}
            >
              <Grid item xs={12}>
                <AppBar />
              </Grid>
              <Grid item xs={12}>
                <Route exact path={[path, `${path}/searchFilter`]} component={SearchFilterFormContainer} />
                <Route exact path={`${path}/search`} component={SubjectSearch} />
                <Route path={`${path}/register`} component={SubjectRegister} />
                <Route path={`${path}/editSubject`} component={SubjectRegister} />
                <Route exact path={`${path}/subject`} component={SubjectDashboard} key={`${Math.random()}`} />
                <Route exact path={`${path}/subject/subjectProfile`} component={(...props) => <SubjectDashboard tab={1} {...props} />} />
                {/* <Route exact path={`${path}/subject`} component={SubjectDashboard} /> */}
                <Route exact path={`${path}/subject/enrol`} component={ProgramEnrol} />
                <Route exact path={`${path}/subject/viewProgramEncounter`} component={ViewVisit} />
                <Route exact path={`${path}/subject/viewEncounter`} component={ViewVisit} />
                <Route exact path={`${path}/subject/addRelative`} component={AddRelative} />
                <Route exact path={`${path}/subject/addGroupMember`} component={GroupMembershipAddEdit} />
                <Route exact path={`${path}/subject/editGroupMembership`} component={GroupMembershipAddEdit} />
                <Route exact path={`${path}/subject/newProgramVisit`} component={NewProgramVisit} />
                <Route exact path={`${path}/subject/programEncounter`} component={ProgramEncounter} />
                <Route path={`${path}/subject/editProgramEncounter`} component={ProgramEncounter} />
                <Route path={`${path}/subject/cancelProgramEncounter`} component={CancelProgramEncounter} />
                <Route path={`${path}/subject/editCancelProgramEncounter`} component={CancelProgramEncounter} />
                <Route exact path={`${path}/subject/newGeneralVisit`} component={NewGeneralVisit} />
                <Route exact path={`${path}/subject/encounter`} component={Encounter} />
                <Route path={`${path}/subject/editEncounter`} component={Encounter} />
                <Route path={`${path}/subject/cancelEncounter`} component={CancelEncounter} />
                <Route path={`${path}/subject/editCancelEncounter`} component={CancelEncounter} />
                <Route exact path={`${path}/news`} component={NewsList} />
                <Route exact path={`${path}/news/:id/details`} component={NewsDetails} />
              </Grid>
            </Grid>
          </div>
          <Route path={`${path}/audio`} component={Player} />
        </I18nextProvider>
      ) : (
        <Loading />
      )}
    </div>
  );
};
const mapStateToProps = state => ({
  operationalModules: state.dataEntry.metadata.operationalModules,
  orgConfig: state.translationsReducer.orgConfig,
  sagaErrorState: state.sagaErrorState
});
export default withRouter(
  connect(
    mapStateToProps,
    null
  )(DataEntry)
);
