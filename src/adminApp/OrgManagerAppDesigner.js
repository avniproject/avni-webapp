import React, { Component } from "react";
import PropTypes from "prop-types";
import { Admin, Resource } from "react-admin";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { authProvider, LogoutButton } from "./react-admin-config";
import { appDesignerHistory, store } from "../common/store";
import SubjectTypesList from "./SubjectType/SubjectTypesList";
import ProgramList from "./Program/ProgramList";
import EncounterTypeList from "./EncounterType/EncounterTypeList";
import { WithProps } from "../common/components/utils";
import customRoutes from "./customRoutes";
import AdminLayout from "../common/components/AdminLayout";
import Forms from "../formDesigner/views/Forms";
import Concepts from "../formDesigner/views/Concepts";
import ImplementationBundle from "../formDesigner/views/ImplementationBundle";
import FormSettings from "../formDesigner/components/FormSettings";
import customFilters from "./CustomFilters";
import { WorklistUpdationRule } from "./WorklistUpdationRule";
import Footer from "../common/components/Footer";

class OrgManagerAppDesigner extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return { store };
  }

  render() {
    const { organisation, user } = this.props;
    const uiDesignerToggle =
      window.location.href.includes("localhost") ||
      window.location.href.includes("staging") ||
      window.location.href.includes("uat");

    return (
      <React.Fragment>
        <Admin
          title="Manage Organisation"
          authProvider={authProvider}
          history={appDesignerHistory}
          logoutButton={WithProps({ user }, LogoutButton)}
          customRoutes={customRoutes}
          appLayout={AdminLayout}
        >
          <Resource
            name="subjectType"
            options={{ label: "Subject Types" }}
            list={uiDesignerToggle && SubjectTypesList}
          />
          <Resource
            name="program"
            options={{ label: "Programs" }}
            list={uiDesignerToggle && ProgramList}
          />
          <Resource
            name="encounterType"
            options={{ label: "Encounter Types" }}
            list={uiDesignerToggle && EncounterTypeList}
          />
          <Resource
            name="forms"
            options={{ label: "Forms" }}
            list={uiDesignerToggle && Forms}
            edit={FormSettings}
          />
          <Resource
            name="concepts"
            options={{ label: "Concepts" }}
            list={uiDesignerToggle && Concepts}
          />
          <Resource
            name="myDashboardFilters"
            options={{ label: "My Dashboard Filters" }}
            list={WithProps({ organisation }, customFilters)}
          />
          <Resource
            name="searchFilters"
            options={{ label: "Search Filters" }}
            list={WithProps({ organisation }, customFilters)}
          />
          <Resource
            name="bundle"
            options={{ label: "Bundle" }}
            list={uiDesignerToggle && ImplementationBundle}
          />
          <Resource
            name="worklistUpdationRule"
            options={{ label: "Worklist Updation Rule" }}
            list={uiDesignerToggle && WorklistUpdationRule}
          />
        </Admin>
        <Footer />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: state.app.user
});

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(OrgManagerAppDesigner)
);
