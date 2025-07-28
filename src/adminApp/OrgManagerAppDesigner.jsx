import { useEffect } from "react";
import PropTypes from "prop-types";
import { Admin, Resource, CustomRoutes } from "react-admin";
import { useNavigate, Route } from "react-router-dom";

import { authProvider, dataProvider } from "./react-admin-config";
import SubjectTypesList from "./SubjectType/SubjectTypesList";
import SubjectTypeEdit from "./SubjectType/SubjectTypeEdit";
import SubjectTypeShow from "./SubjectType/SubjectTypeShow";
import SubjectTypeCreate from "./SubjectType/SubjectTypeCreate";
import ProgramList from "./Program/ProgramList";
import ProgramEdit from "./Program/ProgramEdit";
import ProgramShow from "./Program/ProgramShow";
import ProgramCreate from "./Program/ProgramCreate";
import EncounterTypeList from "./EncounterType/EncounterTypeList";
import EncounterTypeEdit from "./EncounterType/EncounterTypeEdit";
import EncounterTypeShow from "./EncounterType/EncounterTypeShow";
import EncounterTypeCreate from "./EncounterType/EncounterTypeCreate";
import { WithProps } from "../common/components/utils";
import AdminLayout from "../common/components/AdminLayout";
import Forms from "../formDesigner/views/Forms";
import Concepts from "../formDesigner/views/Concepts";
import CreateEditConcept from "../formDesigner/views/CreateEditConcept";
import ConceptDetails from "../formDesigner/components/ConceptDetails";
import FormSettings from "../formDesigner/components/FormSettings";
import FormDetails from "../formDesigner/views/FormDetails";
import customFilters from "./CustomFilters";
import { WorklistUpdationRule } from "./WorklistUpdationRule";
import Relationships from "../formDesigner/components/Relationships/Relationships";
import RelationshipEdit from "../formDesigner/components/Relationships/RelationshipEdit";
import RelationshipShow from "../formDesigner/components/Relationships/RelationshipShow";
import RelationshipCreate from "../formDesigner/components/Relationships/RelationshipCreate";
import RelationshipTypeCreate from "../formDesigner/components/RelationshipTypes/RelationshipTypeCreate";
import ChecklistDetails from "../formDesigner/views/ChecklistDetails";
import RelationshipTypeList from "../formDesigner/components/RelationshipTypes/RelationshipTypeList";
import VideoList from "../formDesigner/components/Video/VideoList";
import VideoShow from "../formDesigner/components/Video/VideoShow";
import { CreateEditVideo } from "../formDesigner/components/Video/CreateEditVideo";
import ReportingViews from "../formDesigner/components/ReportingViews/ReportingViews";
import ReportCardList from "../formDesigner/components/ReportCard/ReportCardList";
import ReportCardShow from "../formDesigner/components/ReportCard/ReportCardShow";
import { CreateEditReportCard } from "../formDesigner/components/ReportCard/CreateEditReportCard";
import DashboardList from "../formDesigner/components/Dashboard/DashboardList";
import DashboardShow from "../formDesigner/components/Dashboard/DashboardShow";
import CreateEditDashboard from "../formDesigner/components/Dashboard/CreateEditDashboard";
import Extensions from "../formDesigner/components/Extensions/Extensions";
import RuleFailureTelemetryList from "../formDesigner/components/RuleFailureTelemetry/RuleFailureTelemetryList";
import SearchResultFields from "../formDesigner/components/SearchResultFields/SearchResultFields";
import ApplicationMenuList from "./ApplicationMenu/ApplicationMenuList";
import ApplicationMenuEdit from "./ApplicationMenu/ApplicationMenuEdit";
import ApplicationMenuShow from "./ApplicationMenu/ApplicationMenuShow";
import { Privilege } from "openchs-models";
import UserInfo from "../common/model/UserInfo";
import { UserMessagingConfig } from "../formDesigner/components/UserMessagingConfig";
import { StorageManagementConfig } from "../formDesigner/components/StorageManagement/StorageManagementConfig";
import ImplementationBundle from "../formDesigner/views/ImplementationBundle";
import CreateEditFiltersHOC from "./components/CreateEditFiltersHOC";

const OrgManagerAppDesigner = ({ organisation, user, userInfo }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = window.location.hash;
    if (["#/appdesigner", "#/appdesigner/"].includes(currentPath)) {
      navigate("/appdesigner/subjectType?page=0", { replace: true });
    }
  }, [navigate]);

  const CreateConcept = () => <CreateEditConcept isCreatePage={true} />;

  return (
    <Admin
      title="Manage Organisation"
      basename="/appdesigner"
      authProvider={authProvider}
      dataProvider={dataProvider}
      layout={AdminLayout}
      darkTheme={null}
    >
      <Resource
        name="subjectType"
        options={{ label: "Subject Types" }}
        list={SubjectTypesList}
        create={SubjectTypeCreate}
        edit={SubjectTypeEdit}
        show={SubjectTypeShow}
      />
      <Resource
        name="program"
        options={{ label: "Programs" }}
        list={ProgramList}
        create={ProgramCreate}
        edit={ProgramEdit}
        show={ProgramShow}
      />
      <Resource
        name="encounterType"
        options={{ label: "Encounter Types" }}
        create={EncounterTypeCreate}
        edit={EncounterTypeEdit}
        show={EncounterTypeShow}
        list={EncounterTypeList}
      />
      <Resource
        name="forms"
        options={{ label: "Forms" }}
        list={Forms}
        edit={FormDetails}
      />
      <Resource
        name="concept"
        options={{ label: "Concepts" }}
        create={CreateConcept}
        list={Concepts}
      />
      <Resource
        name="myDashboardFilters"
        options={{ label: "My Dashboard Filters" }}
        list={WithProps(
          { organisation, filename: "MyDashboardFilter.md" },
          customFilters
        )}
      />
      <Resource
        name="searchFilters"
        options={{ label: "Search Filters" }}
        list={WithProps(
          { organisation, filename: "SearchFilter.md" },
          customFilters
        )}
      />
      {UserInfo.hasPrivilege(
        userInfo,
        Privilege.PrivilegeType.EditOfflineDashboardAndReportCard
      ) && (
        <Resource
          name="searchResultFields"
          options={{ label: "Search Result Fields" }}
          list={SearchResultFields}
        />
      )}
      <Resource
        name="bundle"
        options={{ label: "Bundle" }}
        list={ImplementationBundle}
      />
      <Resource
        name="checklist"
        options={{ label: "Checklist" }}
        list={ChecklistDetails}
      />
      <Resource
        name="worklistUpdationRule"
        options={{ label: "Worklist Updation Rule", worklist: "Worklist" }}
        list={WorklistUpdationRule}
      />
      <Resource
        name="relationship"
        options={{ label: "Relationships" }}
        list={Relationships}
        create={RelationshipCreate}
        edit={RelationshipEdit}
        show={RelationshipShow}
      />
      <Resource
        name="relationshiptype"
        options={{ label: "Relationship Types" }}
        list={RelationshipTypeList}
        create={RelationshipTypeCreate}
      />
      <Resource
        name="video"
        options={{ label: "Video Playlist" }}
        list={VideoList}
        create={CreateEditVideo}
        edit={CreateEditVideo}
        show={VideoShow}
      />
      <Resource
        name="reportingViews"
        options={{ label: "Reporting Views" }}
        list={ReportingViews}
      />
      <Resource
        name="reportCard"
        options={{ label: "Offline Report Card" }}
        list={ReportCardList}
        create={CreateEditReportCard}
        edit={CreateEditReportCard}
        show={ReportCardShow}
      />
      <Resource
        name="dashboard"
        options={{ label: "Offline Dashboard" }}
        list={DashboardList}
        create={CreateEditDashboard}
        edit={CreateEditDashboard}
        show={DashboardShow}
      />
      {UserInfo.hasPrivilege(
        userInfo,
        Privilege.PrivilegeType.EditOrganisationConfiguration
      ) && (
        <Resource
          name="userMessagingConfig"
          options={{ label: "User Messaging Config" }}
          list={UserMessagingConfig}
        />
      )}
      <Resource
        name="applicationMenu"
        options={{ label: "Application Menu" }}
        list={ApplicationMenuList}
        create={ApplicationMenuEdit}
        edit={ApplicationMenuEdit}
        show={ApplicationMenuShow}
      />
      <Resource
        name="extensions"
        options={{ label: "Extensions" }}
        list={Extensions}
      />
      {UserInfo.hasPrivilege(
        userInfo,
        Privilege.PrivilegeType.EditOrganisationConfiguration
      ) && (
        <Resource
          name="appStorageConfig"
          options={{ label: "App Storage Config" }}
          list={StorageManagementConfig}
        />
      )}
      <Resource
        name="ruleFailures"
        options={{ label: "Rule Failures" }}
        list={RuleFailureTelemetryList}
      />
      <CustomRoutes>
        <Route path="/concept/:uuid/show" element={<ConceptDetails />} />
        <Route path="/concept/:uuid/edit" element={<CreateEditConcept />} />
        <Route path="/filters" element={<CreateEditFiltersHOC />} />
        <Route path="/forms/:id/settings" element={<FormSettings />} />
        <Route path="/forms/:uuid" element={<FormDetails />} />
      </CustomRoutes>
    </Admin>
  );
};

OrgManagerAppDesigner.propTypes = {
  organisation: PropTypes.object,
  user: PropTypes.object,
  userInfo: PropTypes.object
};

export default OrgManagerAppDesigner;
