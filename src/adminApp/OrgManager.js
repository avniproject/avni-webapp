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
import Link from "@material-ui/core/Link";

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

class OrgManager extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  constructor(props) {
    super(props);
    if (
      !isEmpty(intersection(this.props.user.roles, [ROLES.ADMIN])) &&
      isEmpty(httpClient.getOrgId())
    ) {
      this.props.getAdminOrgs();
    }
  }

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
      <React.Fragment>
        {!isEmpty(httpClient.getOrgId()) || isEmpty(intersection(user.roles, [ROLES.ADMIN]))
          ? this.renderOrgAdminResources(user, organisation, csvUploadToggle, uiDesignerToggle)
          : this.renderAdminResources(user)}
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

  renderOrgAdminResources(user, organisation, csvUploadToggle, uiDesignerToggle) {
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
        <Resource
          name="userGroups"
          options={{ label: "User Groups" }}
          list={csvUploadToggle && UserGroups}
        />
        <Resource
          name="upload"
          options={{ label: "Upload" }}
          list={csvUploadToggle && UploadDashboard}
        />
        <Resource
          name="identifierSource"
          options={{ label: "Identifier source" }}
          list={IdentifierSourceList}
          show={IdentifierSourceDetail}
          create={IdentifierSourceCreate}
          edit={IdentifierSourceEdit}
        />
        <Resource
          name="identifierUserAssignment"
          options={{ label: "Identifier user assignment" }}
          list={IdentifierUserAssignmentList}
          show={IdentifierUserAssignmentDetail}
          create={IdentifierUserAssignmentCreate}
          edit={IdentifierUserAssignmentEdit}
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
