import React, { useEffect } from "react";
import { Route, withRouter, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import SubjectSearch from "./views/search/SubjectSearch";
import SubjectRegister from "./views/registration/SubjectRegister";
import { getOperationalModules } from "./reducers/metadataReducer";
import { getOrgConfigInfo } from "i18nTranslations/TranslationReducers";
import Loading from "./components/Loading";
import DataEntryDashboard from "./views/dashboardNew/dashboardNew";
import SubjectDashboard from "./views/subjectDashBoard/SubjectDashboard";
import AppBar from "dataEntryApp/components/AppBar";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import qs from "query-string";
import i18n from "i18next";

import { I18nextProvider } from "react-i18next";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  }
}));

const DataEntry = ({
  match: { path },
  getOperationalModules,
  operationalModules,
  getOrgConfigInfo,
  orgConfig
}) => {
  const classes = useStyles();
  let location = useLocation();

  useEffect(() => {
    getOperationalModules();
    getOrgConfigInfo();
  }, []);

  return operationalModules && orgConfig ? (
    <I18nextProvider i18n={i18n}>
      <div className={classes.root}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12}>
            <AppBar />
          </Grid>
          <Grid item xs={12}>
            <Route path={[path, `${path}/dashboard`]} component={DataEntryDashboard} />
            <Route exact path={[path, `${path}/search`]} component={SubjectSearch} />
            <Route path={`${path}/register`} component={SubjectRegister} />
            <Route
              exact
              path={`${path}/subject`}
              component={SubjectDashboard}
              key={qs.parse(location.search).uuid}
            />
          </Grid>
        </Grid>
      </div>
    </I18nextProvider>
  ) : (
    <Loading />
  );
};

const mapStateToProps = state => ({
  operationalModules: state.dataEntry.metadata.operationalModules,
  orgConfig: state.translationsReducer.orgConfig
});

export default withRouter(
  connect(
    mapStateToProps,
    { getOperationalModules, getOrgConfigInfo }
  )(DataEntry)
);
