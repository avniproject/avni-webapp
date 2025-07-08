import React, { Component } from "react";
import PropTypes from "prop-types";
import { Admin, Resource } from "react-admin";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { authProvider, LogoutButton } from "./react-admin-config";
import { appDesignerHistory, store } from "../common/store";
import SubjectTypesList from "./SubjectType/SubjectTypesList";
import ProgramList from "./Program/ProgramList";
import EncounterTypeList from "./EncounterType/EncounterTypeList";
import { WithProps } from "../common/components/utils";
import customRoutes from "./customRoutes";
import AdminLayout from "../common/components/AdminLayout";
import Forms from "../formDesigner/views/Forms";
import Concepts from "../formDesigner/views/Concepts";
import ImplementationBundle from "../formDesigner/views/ImplementationBundle";
import FormSettings from "../formDesigner/components/FormSettings";
import customFilters from "./CustomFilters";
import { WorklistUpdationRule } from "./WorklistUpdationRule";
import Relationships from "../formDesigner/components/Relationships/Relationships";
import ChecklistDetails from "../formDesigner/views/ChecklistDetails";
import RelationshipTypeList from "../formDesigner/components/RelationshipTypes/RelationshipTypeList";
import VideoList from "../formDesigner/components/Video/VideoList";
import ReportingViews from "../formDesigner/components/ReportingViews/ReportingViews";
import ReportCardList from "../formDesigner/components/ReportCard/ReportCardList";
import DashboardList from "../formDesigner/components/Dashboard/DashboardList";
import Extensions from "../formDesigner/components/Extensions/Extensions";
import RuleFailureTelemetryList from "../formDesigner/components/RuleFailureTelemetry/RuleFailureTelemetryList";
import SearchResultFields from "../formDesigner/components/SearchResultFields/SearchResultFields";
import ApplicationMenuList from "./ApplicationMenu/ApplicationMenuList";
import { Privilege } from "openchs-models";
import UserInfo from "../common/model/UserInfo";
import { UserMessagingConfig } from "../formDesigner/components/UserMessagingConfig";
import { ArchivalConfig } from "../formDesigner/components/Archival/ArchivalConfig";

class OrgManagerAppDesigner extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return { store };
  }

  componentWillMount() {
    if (["#/appdesigner", "#/appdesigner/"].includes(window.location.hash)) {
      this.props.history.replace("/appdesigner/subjectType");
    }
  }

  render() {
    const { organisation, user, userInfo } = this.props;

    return (
      <React.Fragment>
        <Admin
          title="Manage Organisation"
          authProvider={authProvider}
          history={appDesignerHistory}
          logoutButton={WithProps({ user }, LogoutButton)}
          customRoutes={customRoutes}
          appLayout={AdminLayout}
        >
          <Resource name="subjectType" options={{ label: "Subject Types" }} list={SubjectTypesList} />
          <Resource name="program" options={{ label: "Programs" }} list={ProgramList} />
          <Resource name="encounterType" options={{ label: "Encounter Types" }} list={EncounterTypeList} />
          <Resource name="forms" options={{ label: "Forms" }} list={Forms} edit={FormSettings} />
          <Resource name="concepts" options={{ label: "Concepts" }} list={Concepts} />
          <Resource
            name="myDashboardFilters"
            options={{ label: "My Dashboard Filters" }}
            list={WithProps({ organisation, filename: "MyDashboardFilter.md" }, customFilters)}
          />
          <Resource
            name="searchFilters"
            options={{ label: "Search Filters" }}
            list={WithProps({ organisation, filename: "SearchFilter.md" }, customFilters)}
          />
          {UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditOfflineDashboardAndReportCard) ? (
            <Resource name="searchResultFields" options={{ label: "Search Result Fields" }} list={SearchResultFields} />
          ) : (
            <div />
          )}
          <Resource name="bundle" options={{ label: "Bundle" }} list={ImplementationBundle} />
          <Resource name={"checklist"} options={{ label: "Checklist" }} list={ChecklistDetails} />
          <Resource name="worklistUpdationRule" options={{ label: "Worklist Updation Rule" }} list={WorklistUpdationRule} />
          <Resource name="relationship" options={{ label: "Relationships" }} list={Relationships} />
          <Resource name="relationshiptype" options={{ label: "Relationship Types" }} list={RelationshipTypeList} />
          <Resource name="video" options={{ label: "Video Playlist" }} list={VideoList} />
          <Resource name="reportingViews" options={{ label: "Reporting Views" }} list={ReportingViews} />
          <Resource name="reportCard" options={{ label: "Offline Report Card" }} list={ReportCardList} />
          <Resource name="dashboard" options={{ label: "Offline Dashboard" }} list={DashboardList} />
          {UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditOrganisationConfiguration) ? (
            <Resource name="userMessagingConfig" options={{ label: "User Messaging Config" }} list={UserMessagingConfig} />
          ) : (
            <div />
          )}
          <Resource name="applicationMenu" options={{ label: "Application Menu" }} list={ApplicationMenuList} />
          <Resource name="extensions" options={{ label: "Extensions" }} list={Extensions} />
          {UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditOrganisationConfiguration) ? (
            <Resource name="syncConfig" options={{ label: "Sync Config" }} list={ArchivalConfig} />
          ) : (
            <div />
          )}
          <Resource name="ruleFailures" options={{ label: "Rule Failures" }} list={RuleFailureTelemetryList} />
        </Admin>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: state.app.authSession,
  userInfo: state.app.userInfo
});

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(OrgManagerAppDesigner)
);
