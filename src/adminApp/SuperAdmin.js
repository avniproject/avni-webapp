import React, { Component } from "react";
import PropTypes from "prop-types";
import { Admin, Resource } from "react-admin";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { authProvider, LogoutButton } from "./react-admin-config";
import { adminHistory, store } from "../common/store";
import { WithProps } from "../common/components/utils";
import {
  OrgAdminUserCreate,
  OrgAdminUserDetail,
  OrgAdminUserEdit,
  OrgAdminUserList
} from "./OrgAdminUser";
import {
  OrganisationCreate,
  OrganisationDetails,
  OrganisationEdit,
  OrganisationList
} from "./Organisation";
import { AccountCreate, AccountDetails, AccountEdit, AccountList } from "./Account";
import {
  OrganisationGroupList,
  organisationGroupCreate,
  OrganisationGroupShow,
  organisationGroupEdit
} from "./OrganisationGroup";
import AdminLayout from "../common/components/AdminLayout";

class SuperAdmin extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return { store };
  }

  render() {
    const { user } = this.props;
    return (
      <Admin
        title="Create Organisation"
        authProvider={authProvider}
        history={adminHistory}
        logoutButton={WithProps({ user }, LogoutButton)}
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
          name="organisation"
          options={{ label: "Organisations" }}
          list={OrganisationList}
          create={OrganisationCreate}
          show={OrganisationDetails}
          edit={OrganisationEdit}
        />
        <Resource
          name="accountAdmin"
          options={{ label: "Account Admins" }}
          list={OrgAdminUserList}
          create={WithProps({ user }, OrgAdminUserCreate)}
          show={WithProps({ user }, OrgAdminUserDetail)}
          edit={WithProps({ user }, OrgAdminUserEdit)}
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
}

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.user
});

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(SuperAdmin)
);
