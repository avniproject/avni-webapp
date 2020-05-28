import React from "react";
import { Route } from "react-router-dom";
import { CreateEditLanguages } from "./components/CreateEditLanguages";
import { CreateEditFilters } from "./components/CreateEditFilters";
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
import { VideoShow } from "../formDesigner/components/Video/VideoShow";
import { WithProps } from "../common/components/utils";

const CreateConcept = () => <CreateEditConcept isCreatePage={true} />;

export default [
  <Route exact path="/editLanguages" component={CreateEditLanguages} />,
  <Route exact path="/filters" component={CreateEditFilters} />,
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
  <Route exact path="/video/:id/show" component={VideoShow} />
];
