import { useEffect } from "react";
import { Admin, Resource } from "react-admin";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";

import { authProvider, LogoutButton } from "./react-admin-config";
import { WithProps } from "../common/components/utils";
import customRoutes from "./customRoutes";
import AdminLayout from "../common/components/AdminLayout";
import { getAdminOrgs } from "../rootApp/ducks";

import { AccountCreate, AccountDetails, AccountEdit, AccountList } from "./Account";
import {
  AccountOrgAdminUserCreate,
  AccountOrgAdminUserDetail,
  AccountOrgAdminUserEdit,
  AccountOrgAdminUserList
} from "./AccountOrgAdminUser";
import { OrganisationCreate, OrganisationDetails, OrganisationEdit, OrganisationList } from "./Organisation";
import { organisationGroupCreate, organisationGroupEdit, OrganisationGroupList, OrganisationGroupShow } from "./OrganisationGroup";

const DeploymentManager = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.app.authSession);
  const userInfo = useSelector(state => state.app.userInfo);
  const organisations = useSelector(state => state.app.organisations);

  useEffect(() => {
    dispatch(getAdminOrgs());
  }, [dispatch]);
  return (
    <Admin
      title="Manage Account"
      authProvider={authProvider}
      logoutButton={WithProps({ user }, LogoutButton)}
      customRoutes={customRoutes}
      layout={AdminLayout}
    >
      <Resource
        name="account"
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
        create={WithProps({ user, region: userInfo.region }, AccountOrgAdminUserCreate)}
        show={WithProps({ user, region: userInfo.region }, AccountOrgAdminUserDetail)}
        edit={WithProps({ user, region: userInfo.region }, AccountOrgAdminUserEdit)}
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
        name="organisationGroup"
        options={{ label: "Organisation Groups" }}
        list={OrganisationGroupList}
        create={organisationGroupCreate}
        show={OrganisationGroupShow}
        edit={organisationGroupEdit}
      />
      <Resource name="organisationCategory" />
      <Resource name="organisationStatus" />
    </Admin>
  );
};

DeploymentManager.propTypes = {
  user: PropTypes.object,
  userInfo: PropTypes.object
};

export default DeploymentManager;
