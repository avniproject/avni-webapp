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
import {
  IdentifierSourceCreate,
  IdentifierSourceList,
  IdentifierSourceDetail,
  IdentifierSourceEdit
} from "./IdentifierSource";
import {
  IdentifierUserAssignmentList,
  IdentifierUserAssignmentDetail,
  IdentifierUserAssignmentEdit,
  IdentifierUserAssignmentCreate
} from "./IdentifierUserAssignment";
import customConfig from "./OrganisationConfig";
import { WithProps } from "../common/components/utils";

import { Dashboard as UploadDashboard } from "../upload";
import customRoutes from "./customRoutes";
import AdminLayout from "../common/components/AdminLayout";
import { intersection, isEmpty } from "lodash";
import httpClient from "../common/utils/httpClient";
import { AccountCreate, AccountDetails, AccountEdit, AccountList } from "./Account";
import {
  AccountOrgAdminUserCreate,
  AccountOrgAdminUserDetail,
  AccountOrgAdminUserEdit,
  AccountOrgAdminUserList
} from "./AccountOrgAdminUser";
import {
  OrganisationCreate,
  OrganisationDetails,
  OrganisationEdit,
  OrganisationList
} from "./Organisation";
import {
  organisationGroupCreate,
  organisationGroupEdit,
  OrganisationGroupList,
  OrganisationGroupShow
} from "./OrganisationGroup";
import { ROLES } from "../common/constants";
import { getAdminOrgs } from "../rootApp/ducks";
import UserGroups from "../userGroups/UserGroups";
import Footer from "../common/components/Footer";
import { OrganisationDetail } from "./OrganisationDetail";

class OrgManager extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  getChildContext() {
    return { store };
  }

  render() {
    const { organisation, user } = this.props;
    return (
      <React.Fragment>
        {!isEmpty(httpClient.getOrgUUID()) || isEmpty(intersection(user.roles, [ROLES.ADMIN]))
          ? this.renderOrgAdminResources(user, organisation)
          : this.renderAdminResources(user)}
        <Footer />
      </React.Fragment>
    );
  }

  renderAdminResources(user) {
    return (
      <Admin
        title="Manage Account"
        authProvider={authProvider}
        history={adminHistory}
        logoutButton={WithProps({ user }, LogoutButton)}
        customRoutes={customRoutes}
        appLayout={AdminLayout}
      >
        <Resource
          name={"account"}
          options={{ label: "Accounts" }}
          list={AccountList}
          show={AccountDetails}
          create={AccountCreate}
          edit={AccountEdit}
        />
        <Resource
          name="accountOrgAdmin"
          options={{ label: "Admins" }}
          list={AccountOrgAdminUserList}
          create={WithProps({ user }, AccountOrgAdminUserCreate)}
          show={WithProps({ user }, AccountOrgAdminUserDetail)}
          edit={WithProps({ user }, AccountOrgAdminUserEdit)}
        />
        <Resource
          name="organisation"
          options={{ label: "Organisations" }}
          list={OrganisationList}
          create={OrganisationCreate}
          show={OrganisationDetails}
          edit={OrganisationEdit}
        />
        <Resource
          name={"organisationGroup"}
          options={{ label: "Organisation Groups" }}
          list={OrganisationGroupList}
          create={organisationGroupCreate}
          show={OrganisationGroupShow}
          edit={organisationGroupEdit}
        />
      </Admin>
    );
  }

  renderOrgAdminResources(user, organisation) {
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
          name="language"
          options={{ label: "Languages" }}
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
        <Resource name="userGroups" options={{ label: "User Groups" }} list={UserGroups} />
        <Resource name="upload" options={{ label: "Upload" }} list={UploadDashboard} />
        <Resource
          name="identifierSource"
          options={{ label: "Identifier Source" }}
          list={IdentifierSourceList}
          show={IdentifierSourceDetail}
          create={IdentifierSourceCreate}
          edit={IdentifierSourceEdit}
        />
        <Resource
          name="identifierUserAssignment"
          options={{ label: "Identifier User Assignment" }}
          list={IdentifierUserAssignmentList}
          show={IdentifierUserAssignmentDetail}
          create={IdentifierUserAssignmentCreate}
          edit={IdentifierUserAssignmentEdit}
        />
        <Resource
          name="organisationDetails"
          options={{ label: "Organisation Details" }}
          list={WithProps({ organisation }, OrganisationDetail)}
        />
      </Admin>
    );
  }
}

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.user,
  organisations: state.app.organisations
});

export default withRouter(
  connect(
    mapStateToProps,
    { getAdminOrgs }
  )(OrgManager)
);
