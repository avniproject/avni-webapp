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

class SuperAdmin extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return { store };
  }

  render() {
    const { organisation, user } = this.props;
    return (
      <Admin
        title="Create Organisation"
        authProvider={authProvider}
        history={adminHistory}
        logoutButton={WithProps({ user }, LogoutButton)}
      >
        <Resource
          name="organisation"
          options={{ label: "Organisations" }}
          list={WithProps({ organisation }, OrganisationList)}
          create={WithProps({ organisation }, OrganisationCreate)}
          show={WithProps({ user }, OrganisationDetails)}
          edit={WithProps({ user }, OrganisationEdit)}
        />
        <Resource
          name="user"
          options={{ label: "Org Admin Users" }}
          list={WithProps({ organisation }, OrgAdminUserList)}
          create={WithProps({ organisation }, OrgAdminUserCreate)}
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
