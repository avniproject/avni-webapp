import React from "react";
import { Route } from "react-router-dom";
import { CreateEditLanguages } from "./components/CreateEditLanguages";
import { CreateEditFilters } from "./components/CreateEditFilters";
import FormDetails from "../formDesigner/views/FormDetails";
import CreateEditConcept from "../formDesigner/views/CreateEditConcept";
const CreateConcept = () => <CreateEditConcept isCreatePage={true} />;

export default [
  <Route exact path="/languages" component={CreateEditLanguages} />,
  <Route exact path="/filters" component={CreateEditFilters} />,
  <Route exact path="/forms/:formUUID" component={FormDetails} />,
  <Route exact path="/concept/create" component={CreateConcept} />,
  <Route exact path="/concept/:uuid/edit" component={CreateEditConcept} />
];
