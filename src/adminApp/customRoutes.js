import React from "react";
import { Route } from "react-router-dom";
import { CreateEditLanguages } from "./components/CreateEditLanguages";
import { CreateEditFiltersHOC } from "./components/CreateEditFiltersHOC";
import FormDetails from "../formDesigner/views/FormDetails";
import CreateEditConcept from "../formDesigner/views/CreateEditConcept";
import ConceptDetails from "../formDesigner/components/ConceptDetails";
import SubjectTypeShow from "./SubjectType/SubjectTypeShow";
import SubjectTypeCreate from "./SubjectType/SubjectTypeCreate";
import SubjectTypeEdit from "./SubjectType/SubjectTypeEdit";
import ProgramShow from "./Program/ProgramShow";
import ProgramCreate from "./Program/ProgramCreate";
import ProgramEdit from "./Program/ProgramEdit";
import EncounterTypeShow from "./EncounterType/EncounterTypeShow";
import EncounterTypeCreate from "./EncounterType/EncounterTypeCreate";
import EncounterTypeEdit from "./EncounterType/EncounterTypeEdit";
import UserGroupDetails from "../userGroups/UserGroupDetails";
import RelationshipCreate from "../formDesigner/components/Relationships/RelationshipCreate";
import RelationshipShow from "../formDesigner/components/Relationships/RelationshipShow";
import RelationshipEdit from "../formDesigner/components/Relationships/RelationshipEdit";
import RelationshipTypeCreate from "../formDesigner/components/RelationshipTypes/RelationshipTypeCreate";
import { CreateEditVideo } from "../formDesigner/components/Video/CreateEditVideo";
import VideoShow from "../formDesigner/components/Video/VideoShow";
import { WithProps } from "../common/components/utils";
import { CreateEditReportCard } from "../formDesigner/components/ReportCard/CreateEditReportCard";
import ReportCardShow from "../formDesigner/components/ReportCard/ReportCardShow";
import CreateEditDashboard from "../formDesigner/components/Dashboard/CreateEditDashboard";
import DashboardShow from "../formDesigner/components/Dashboard/DashboardShow";
import ApplicationMenuEdit from "./ApplicationMenu/ApplicationMenuEdit";
import ApplicationMenuShow from "./ApplicationMenu/ApplicationMenuShow";

const CreateConcept = () => <CreateEditConcept isCreatePage={true} />;

export default [
  <Route exact path="/editLanguages" component={CreateEditLanguages} />,
  <Route exact path="/filters" component={CreateEditFiltersHOC} />,
  <Route exact path="/forms/:formUUID" component={FormDetails} />,
  <Route exact path="/concept/create" component={CreateConcept} />,
  <Route exact path="/concept/:uuid/show" component={ConceptDetails} />,
  <Route exact path="/concept/:uuid/edit" component={CreateEditConcept} />,
  <Route exact path="/subjectType/:id/show" component={SubjectTypeShow} />,
  <Route exact path="/subjectType/create" component={SubjectTypeCreate} />,
  <Route exact path="/subjectType/:id" component={SubjectTypeEdit} />,
  <Route exact path="/program/:id/show" component={ProgramShow} />,
  <Route exact path="/program/create" component={ProgramCreate} />,
  <Route exact path="/program/:id" component={ProgramEdit} />,
  <Route exact path="/encounterType/:id/show" component={EncounterTypeShow} />,
  <Route exact path="/encounterType/create" component={EncounterTypeCreate} />,
  <Route exact path="/encounterType/:id" component={EncounterTypeEdit} />,
  <Route exact path="/userGroupDetails/:id" component={UserGroupDetails} />,
  <Route exact path="/relationship/create" component={RelationshipCreate} />,
  <Route exact path="/relationship/:id/show" component={RelationshipShow} />,
  <Route exact path="/relationship/:id" component={RelationshipEdit} />,
  <Route exact path="/relationshiptype/create" component={RelationshipTypeCreate} />,
  <Route exact path="/video/create" component={WithProps({ edit: false }, CreateEditVideo)} />,
  <Route exact path="/video/:id" component={WithProps({ edit: true }, CreateEditVideo)} />,
  <Route exact path="/video/:id/show" component={VideoShow} />,
  <Route
    exact
    path="/reportCard/create"
    component={WithProps({ edit: false }, CreateEditReportCard)}
  />,
  <Route
    exact
    path="/reportCard/:id"
    component={WithProps({ edit: true }, CreateEditReportCard)}
  />,
  <Route exact path="/reportCard/:id/show" component={ReportCardShow} />,
  <Route
    exact
    path="/dashboard/create"
    component={WithProps({ edit: false }, CreateEditDashboard)}
  />,
  <Route exact path="/dashboard/:id" component={WithProps({ edit: true }, CreateEditDashboard)} />,
  <Route exact path="/dashboard/:id/show" component={DashboardShow} />,
  <Route exact path="/applicationMenu/create" component={ApplicationMenuEdit} />,
  <Route exact path="/applicationMenu/:id/show" component={ApplicationMenuShow} />,
  <Route exact path="/applicationMenu/:id" component={ApplicationMenuEdit} />
];
