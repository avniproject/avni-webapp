import { useEffect } from "react";
import { Admin, CustomRoutes, Resource } from "react-admin";
import { Route, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { authProvider, dataProvider } from "./react-admin-config";
import { UserCreate, UserDetail, UserEdit, UserList } from "./user";
import {
  CatchmentCreate,
  CatchmentDetail,
  CatchmentEdit,
  CatchmentList
} from "./catchment";
import {
  LocationTypeCreate,
  LocationTypeDetail,
  LocationTypeEdit,
  LocationTypeList
} from "./addressLevelType";
import {
  LocationCreate,
  LocationDetail,
  LocationEdit,
  LocationList
} from "./locations";
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
import { UploadDashboard } from "../upload";
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
import UserGroupDetails from "../userGroups/UserGroupDetails";
import CreateEditLanguages from "./components/CreateEditLanguages";

const OrgManager = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const organisation = useSelector(state => state.app.organisation);
  const user = useSelector(state => state.app.authSession);
  const userInfo = useSelector(state => state.app.userInfo);

  useEffect(() => {
    if (["#/admin", "#/admin/"].includes(window.location.hash)) {
      navigate("/admin/user", { replace: true });
    }
    // Only fetch admin orgs if user has admin privileges
    if (userInfo && CurrentUserService.isAdminButNotImpersonating(userInfo)) {
      dispatch(getAdminOrgs());
    }
  }, [navigate, dispatch, userInfo]);

  if (CurrentUserService.isAdminButNotImpersonating(userInfo)) {
    return <DeploymentManager />;
  }

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
    DeleteOrganisationConfiguration,
    EditLanguage,
    PhoneVerification
  } = Privilege.PrivilegeType;

  const { hasPrivilege, hasMultiplePrivileges } = UserInfo;
  const canEditCatchment = hasPrivilege(userInfo, EditCatchment);

  return (
    <OrgManagerContext.Provider value={{ organisation }}>
      <Admin
        title="Manage Organisation"
        basename="/admin"
        authProvider={authProvider}
        dataProvider={dataProvider}
        layout={AdminLayout}
        darkTheme={null}
      >
        <Resource
          name="addressLevelType"
          options={{ label: "Location Types" }}
          list={LocationTypeList}
          show={LocationTypeDetail}
          create={
            hasPrivilege(userInfo, EditLocationType) && LocationTypeCreate
          }
          edit={hasPrivilege(userInfo, EditLocationType) && LocationTypeEdit}
          sx={{ marginTop: "10000" }}
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
          show={WithProps(
            { hasEditPrivilege: canEditCatchment },
            CatchmentDetail
          )}
          create={canEditCatchment && CatchmentCreate}
          edit={canEditCatchment && CatchmentEdit}
        />
        {hasPrivilege(userInfo, EditUserConfiguration) && (
          <Resource
            name="user"
            list={UserList}
            create={WithProps({ organisation, userInfo }, UserCreate)}
            show={WithProps({ user, hasEditUserPrivilege: true }, UserDetail)}
            edit={WithProps({ organisation }, UserEdit)}
          />
        )}
        {hasMultiplePrivileges(userInfo, [
          EditUserGroup,
          EditUserConfiguration
        ]) && (
          <>
            <Resource
              name="userGroups"
              options={{ label: "User Groups" }}
              list={UserGroups}
            />
            <Resource
              name="userGroupDetails"
              options={{ label: "User Group Details" }}
              edit={UserGroupDetails}
            />
          </>
        )}
        <Resource name="group" />
        <Resource name="task" options={{ label: "Tasks" }} />
        {hasPrivilege(userInfo, UploadMetadataAndData) && (
          <Resource
            name="upload"
            options={{ label: "Upload" }}
            list={UploadDashboard}
          />
        )}
        <Resource
          name="identifierSource"
          options={{ label: "Identifier Source" }}
          list={IdentifierSourceList}
          show={IdentifierSourceDetail}
          create={
            hasPrivilege(userInfo, EditIdentifierSource) &&
            IdentifierSourceCreate
          }
          edit={
            hasPrivilege(userInfo, EditIdentifierSource) && IdentifierSourceEdit
          }
        />
        <Resource
          name="identifierUserAssignment"
          options={{ label: "Identifier User Assignment" }}
          list={IdentifierUserAssignmentList}
          show={IdentifierUserAssignmentDetail}
          create={
            hasPrivilege(userInfo, EditIdentifierUserAssignment) &&
            IdentifierUserAssignmentCreate
          }
          edit={
            hasPrivilege(userInfo, EditIdentifierUserAssignment) &&
            IdentifierUserAssignmentEdit
          }
        />
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
          name="organisationDetails"
          options={{ label: "Organisation Details" }}
          list={WithProps(
            {
              organisation,
              hasEditPrivilege: hasPrivilege(
                userInfo,
                EditOrganisationConfiguration
              ),
              hasOrgMetadataDeletionPrivilege: hasPrivilege(
                userInfo,
                UploadMetadataAndData
              ),
              hasOrgAdminConfigDeletionPrivilege: hasPrivilege(
                userInfo,
                DeleteOrganisationConfiguration
              )
            },
            OrganisationDetail
          )}
        />
        {hasPrivilege(userInfo, PhoneVerification) && (
          <Resource
            name="phoneNumberVerification"
            options={{ label: "Phone Verification" }}
            list={Msg91Config}
          />
        )}
        <CustomRoutes>
          <Route path="/editLanguages" element={<CreateEditLanguages />} />
        </CustomRoutes>
      </Admin>
    </OrgManagerContext.Provider>
  );
};

export default OrgManager;
