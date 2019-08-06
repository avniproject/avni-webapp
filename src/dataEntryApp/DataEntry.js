import React, { useEffect } from "react";
import { Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import SubjectSearch from "./views/search/SubjectSearch";
import SubjectRegister from "./views/registration/SubjectRegister";
import { getOperationalModules } from "./reducers/metadataReducer";
import Loading from "./components/Loading";

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
      <Route exact path={[path, `${path}/search`]} component={SubjectSearch} />
      <Route exact path={`${path}/register`} component={SubjectRegister} />
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
