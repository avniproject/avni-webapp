import React, { Component } from "react";
import PropTypes from "prop-types";
import { Admin, Resource } from "react-admin";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { authProvider, LogoutButton } from "./react-admin-config";
import { adminHistory, store } from "../common/store";
import { UserCreate, UserDetail, UserEdit, UserList } from "./user";
import { CatchmentCreate, CatchmentDetail, CatchmentEdit, CatchmentList } from "./catchment";
import {
  LocationTypeCreate,
  LocationTypeDetail,
  LocationTypeEdit,
  LocationTypeList
} from "./addressLevelType";
import { LocationCreate, LocationDetail, LocationEdit, LocationList } from "./locations";
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
import customConfig from "./OrganisationConfig";
import { WithProps } from "../common/components/utils";

import { Dashboard as UploadDashboard } from "../upload";
import customRoutes from "./customRoutes";
import AdminLayout from "../common/components/AdminLayout";
import Forms from "../formDesigner/views/Forms";
import Concepts from "../formDesigner/views/Concepts";
import ImplementationBundle from "../formDesigner/views/ImplementationBundle";

class OrgManager extends Component {
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
    const csvUploadToggle =
      window.location.href.includes("localhost") ||
      window.location.href.includes("staging") ||
      window.location.href.includes("uat");
    return (
      <Admin
        title="Manage Organisation"
        authProvider={authProvider}
        history={adminHistory}
        logoutButton={WithProps({ user }, LogoutButton)}
        customRoutes={customRoutes}
        appLayout={AdminLayout}
      >
        <Resource
          name="organisationConfig"
          options={{ label: "Organisation Config" }}
          list={WithProps({ organisation }, customConfig)}
        />
        <Resource
          name="addressLevelType"
          options={{ label: "Location Types" }}
          list={LocationTypeList}
          show={LocationTypeDetail}
          create={LocationTypeCreate}
          edit={LocationTypeEdit}
        />
        <Resource
          name="locations"
          options={{ label: "Locations" }}
          list={LocationList}
          show={LocationDetail}
          create={LocationCreate}
          edit={LocationEdit}
        />
        <Resource
          name="catchment"
          list={CatchmentList}
          show={CatchmentDetail}
          create={CatchmentCreate}
          edit={CatchmentEdit}
        />
        <Resource
          name="user"
          list={WithProps({ organisation }, UserList)}
          create={WithProps({ organisation }, UserCreate)}
          show={WithProps({ user }, UserDetail)}
          edit={WithProps({ user }, UserEdit)}
        />
        <Resource
          name="upload"
          options={{ label: "Upload" }}
          list={csvUploadToggle && UploadDashboard}
        />
        <Resource
          name="subjectType"
          options={{ label: "Subject Types" }}
          list={uiDesignerToggle && SubjectTypeList}
          show={SubjectTypeDetail}
          create={SubjectTypeCreate}
          edit={SubjectTypeEdit}
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
        <Resource name="forms" options={{ label: "Forms" }} list={uiDesignerToggle && Forms} />
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
      </Admin>
    );
  }
}

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.user
});

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(OrgManager)
);
