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
        appLayout={AdminLayout}
      >
        <Resource
          name="organisation"
          options={{ label: "Organisations" }}
          list={OrganisationList}
          create={OrganisationCreate}
          show={OrganisationDetails}
          edit={OrganisationEdit}
        />
        <Resource
          name="orgAdmin"
          options={{ label: "Org Admin Users" }}
          list={OrgAdminUserList}
          create={WithProps({ user }, OrgAdminUserCreate)}
          show={WithProps({ user }, OrgAdminUserDetail)}
          edit={WithProps({ user }, OrgAdminUserEdit)}
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
