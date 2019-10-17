import React from "react";
import { Route } from "react-router-dom";
import { CreateEditLanguages } from "./components/CreateEditLanguages";
import { CreateEditFilters } from "./components/CreateEditFilters";

export default [
  <Route exact path="/languages" component={CreateEditLanguages} />,
  <Route exact path="/filters" component={CreateEditFilters} />
];
