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
import Footer from "../common/components/Footer";
import Relationships from "../formDesigner/components/Relationships/Relationships";
import { ChecklistDetails } from "../formDesigner/views/ChecklistDetails";
import RelationshipTypeList from "../formDesigner/components/RelationshipTypes/RelationshipTypeList";
import { VideoList } from "../formDesigner/components/Video/VideoList";
class OrgManagerAppDesigner extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return { store };
  }

  render() {
    const { organisation, user } = this.props;

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
          <Resource
            name="subjectType"
            options={{ label: "Subject Types" }}
            list={SubjectTypesList}
          />
          <Resource name="program" options={{ label: "Programs" }} list={ProgramList} />
          <Resource
            name="encounterType"
            options={{ label: "Encounter Types" }}
            list={EncounterTypeList}
          />
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
          <Resource name="bundle" options={{ label: "Bundle" }} list={ImplementationBundle} />
          <Resource name={"checklist"} options={{ label: "Checklist" }} list={ChecklistDetails} />
          <Resource
            name="worklistUpdationRule"
            options={{ label: "Worklist Updation Rule" }}
            list={WorklistUpdationRule}
          />
          <Resource name="relationship" options={{ label: "Relationships" }} list={Relationships} />
          <Resource
            name="relationshiptype"
            options={{ label: "Relationship Types" }}
            list={RelationshipTypeList}
          />
          <Resource name="video" options={{ label: "Video Playlist" }} list={VideoList} />
        </Admin>
        <Footer />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: state.app.user
});

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(OrgManagerAppDesigner)
);
