import React, { Component } from "react";
import PropTypes from "prop-types";
import { Admin, Resource } from "react-admin";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { authProvider, LogoutButton } from "./react-admin-config";
import { appDesignerHistory, store } from "../common/store";
import { ProgramCreate, ProgramDetail, ProgramEdit, ProgramList } from "./programs";
import {
  SubjectTypeCreate,
  SubjectTypeDetail,
  SubjectTypeEdit,
  SubjectTypeList
} from "./SubjectTypes";
import {
  EncounterTypeCreate,
  EncounterTypeDetail,
  EncounterTypeEdit,
  EncounterTypeList
} from "./EncounterTypes";
import customFilters from "./CustomFilters";
import { WithProps } from "../common/components/utils";
import Link from "@material-ui/core/Link";
import customRoutes from "./customRoutes";
import AdminLayout from "../common/components/AdminLayout";
import Forms from "../formDesigner/views/Forms";
import Concepts from "../formDesigner/views/Concepts";
import ImplementationBundle from "../formDesigner/views/ImplementationBundle";
import FormSettings from "../formDesigner/components/FormSettings";
import { WorklistUpdationRule } from "./WorklistUpdationRule";

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
            list={uiDesignerToggle && SubjectTypeList}
            show={SubjectTypeDetail}
            create={SubjectTypeCreate}
            edit={SubjectTypeEdit}
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
            name="program"
            options={{ label: "Programs" }}
            list={uiDesignerToggle && ProgramList}
            show={ProgramDetail}
            create={ProgramCreate}
            edit={ProgramEdit}
          />
          <Resource
            name="encounterType"
            options={{ label: "Encounter Types" }}
            list={uiDesignerToggle && EncounterTypeList}
            show={EncounterTypeDetail}
            create={EncounterTypeCreate}
            edit={EncounterTypeEdit}
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
        <div
          style={{
            position: "fixed",
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 100,
            padding: 6,
            backgroundColor: "#2196f3",
            textAlign: "center"
          }}
        >
          <div style={{ color: "white" }}>
            This app is in beta. Please share your feedback by clicking{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                window.open("https://forms.gle/65q4DkxbS4onroys9", "_blank");
              }}
              style={{ color: "black", fontSize: 18 }}
            >
              here
            </Link>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: state.app.user
});

export default withRouter(connect(mapStateToProps, null)(OrgManagerAppDesigner));
