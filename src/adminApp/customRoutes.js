import React from "react";
import { Route } from "react-router-dom";
import { CreateEditLanguages } from "./components/CreateEditLanguages";
import { CreateEditFilters } from "./components/CreateEditFilters";
import FormDetails from "../formDesigner/views/FormDetails";
import CreateEditConcept from "../formDesigner/views/CreateEditConcept";
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

const CreateConcept = () => <CreateEditConcept isCreatePage={true} />;

export default [
  <Route exact path="/editLanguages" component={CreateEditLanguages} />,
  <Route exact path="/filters" component={CreateEditFilters} />,
  <Route exact path="/forms/:formUUID" component={FormDetails} />,
  <Route exact path="/concept/create" component={CreateConcept} />,
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
  <Route exact path="/userGroupDetails/:id" component={UserGroupDetails} />
];
