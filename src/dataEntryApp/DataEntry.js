import React, { useEffect } from "react";
import { Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import SubjectSearch from "./views/search/SubjectSearch";
import SubjectRegister from "./views/registration/SubjectRegister";
import { getOperationalModules } from "./reducers/metadataReducer";
import Loading from "./components/Loading";
import dashboardNew from "./views/dashboardNew/dashboardNew";
import SubjectDashboard from "./views/subjectDashBoard/SubjectDashboard";

const DataEntry = ({
  match: { path },
  getOperationalModules,
  operationalModules
}) => {
  useEffect(() => {
    getOperationalModules();
  }, []);

  return operationalModules ? (
    <div>
       <Route path={[path,`${path}/dashboardNew`]} component={dashboardNew} />
      <Route exact path={`${path}/search`} component={SubjectSearch} />
      <Route path={`${path}/register`} component={SubjectRegister} />
      <Route path={`${path}/SubjectDashboard`} component={SubjectDashboard} />
    </div>
  ) : (
    <Loading />
  );
};

const mapStateToProps = state => ({
  operationalModules: state.dataEntry.metadata.operationalModules
});

export default withRouter(
  connect(
    mapStateToProps,
    { getOperationalModules }
  )(DataEntry)
);
