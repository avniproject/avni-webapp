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
  IdentifierSourceDetail,
  IdentifierSourceEdit,
  IdentifierSourceList
} from "./IdentifierSource";
import {
  IdentifierUserAssignmentCreate,
  IdentifierUserAssignmentDetail,
  IdentifierUserAssignmentEdit,
  IdentifierUserAssignmentList
} from "./IdentifierUserAssignment";
import OrganisationConfig from "./OrganisationConfig";
import { WithProps } from "../common/components/utils";

import { Dashboard as UploadDashboard } from "../upload";
import customRoutes from "./customRoutes";
import AdminLayout from "../common/components/AdminLayout";
import { getAdminOrgs } from "../rootApp/ducks";
import UserGroups from "../userGroups/UserGroups";
import { OrganisationDetail } from "./OrganisationDetail";
import Msg91Config from "../phoneNumberVerification/Msg91Config";
import CurrentUserService from "../common/service/CurrentUserService";
import DeploymentManager from "./DeploymentManager";
import UserInfo from "../common/model/UserInfo";
import { Privilege } from "openchs-models";
import OrgManagerContext from "./OrgManagerContext";

class OrgManager extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return { store };
  }

  render() {
    const { organisation, user, userInfo } = this.props;
    const {
      EditLocationType,
      EditLocation,
      EditCatchment,
      EditUserConfiguration,
      EditUserGroup,
      EditIdentifierSource,
      EditIdentifierUserAssignment,
      UploadMetadataAndData,
      EditOrganisationConfiguration,
      EditLanguage,
      PhoneVerification
    } = Privilege.PrivilegeType;
    const { hasPrivilege, hasMultiplePrivileges } = UserInfo;

    if (CurrentUserService.isAdminButNotImpersonating(userInfo)) return <DeploymentManager />;

    const canEditCatchment = hasPrivilege(userInfo, EditCatchment);
    return (
      <OrgManagerContext.Provider value={{ organisation }}>
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
            list={WithProps(
              {
                organisation,
                hasEditPrivilege: hasPrivilege(userInfo, EditLanguage)
              },
              OrganisationConfig
            )}
          />
          <Resource
            name="addressLevelType"
            options={{ label: "Location Types" }}
            list={LocationTypeList}
            show={LocationTypeDetail}
            create={hasPrivilege(userInfo, EditLocationType) && LocationTypeCreate}
            edit={hasPrivilege(userInfo, EditLocationType) && LocationTypeEdit}
          />
          <Resource
            name="locations"
            options={{ label: "Locations" }}
            list={LocationList}
            show={LocationDetail}
            create={hasPrivilege(userInfo, EditLocation) && LocationCreate}
            edit={hasPrivilege(userInfo, EditLocation) && LocationEdit}
          />
          <Resource
            name="catchment"
            list={CatchmentList}
            show={WithProps({ hasEditPrivilege: canEditCatchment }, CatchmentDetail)}
            create={canEditCatchment && CatchmentCreate}
            edit={canEditCatchment && CatchmentEdit}
          />
          {hasPrivilege(userInfo, EditUserConfiguration) ? (
            <Resource
              name="user"
              list={UserList}
              create={
                hasPrivilege(userInfo, EditUserConfiguration) &&
                WithProps({ organisation, userInfo }, UserCreate)
              }
              show={WithProps(
                { user, hasEditUserPrivilege: hasPrivilege(userInfo, EditUserConfiguration) },
                UserDetail
              )}
              edit={hasPrivilege(userInfo, EditUserConfiguration) && UserEdit}
            />
          ) : (
            <div />
          )}
          {hasMultiplePrivileges(userInfo, [EditUserGroup, EditUserConfiguration]) ? (
            <Resource name="userGroups" options={{ label: "User Groups" }} list={UserGroups} />
          ) : (
            <div />
          )}
          <Resource name="group" />
          <Resource name="task" options={{ label: "Tasks" }} />
          {hasPrivilege(userInfo, UploadMetadataAndData) ? (
            <Resource name="upload" options={{ label: "Upload" }} list={UploadDashboard} />
          ) : (
            <div />
          )}
          <Resource
            name="identifierSource"
            options={{ label: "Identifier Source" }}
            list={IdentifierSourceList}
            show={IdentifierSourceDetail}
            create={hasPrivilege(userInfo, EditIdentifierSource) && IdentifierSourceCreate}
            edit={hasPrivilege(userInfo, EditIdentifierSource) && IdentifierSourceEdit}
          />
          <Resource
            name="identifierUserAssignment"
            options={{ label: "Identifier User Assignment" }}
            list={IdentifierUserAssignmentList}
            show={IdentifierUserAssignmentDetail}
            create={
              hasPrivilege(userInfo, EditIdentifierUserAssignment) && IdentifierUserAssignmentCreate
            }
            edit={
              hasPrivilege(userInfo, EditIdentifierUserAssignment) && IdentifierUserAssignmentEdit
            }
          />
          <Resource
            name="organisationDetails"
            options={{ label: "Organisation Details" }}
            list={WithProps(
              {
                organisation,
                hasEditPrivilege: hasPrivilege(userInfo, EditOrganisationConfiguration)
              },
              OrganisationDetail
            )}
          />
          {hasPrivilege(userInfo, PhoneVerification) ? (
            <Resource
              name="phoneNumberVerification"
              options={{ label: "Phone Verification" }}
              list={Msg91Config}
            />
          ) : (
            <div />
          )}
        </Admin>
      </OrgManagerContext.Provider>
    );
  }
}

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.authSession,
  userInfo: state.app.userInfo
});

export default withRouter(
  connect(
    mapStateToProps,
    { getAdminOrgs }
  )(OrgManager)
);
