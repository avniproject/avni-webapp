import { Route } from "react-router-dom";
import CreateEditLanguages from "./components/CreateEditLanguages";
import CreateEditFiltersHOC from "./components/CreateEditFiltersHOC";
import FormDetails from "../formDesigner/views/FormDetails";
import UserGroupDetails from "../userGroups/UserGroupDetails";

export default [
  <Route path="/editLanguages" element={<CreateEditLanguages />} />,
  <Route path="/filters" element={<CreateEditFiltersHOC />} />,
  <Route path="/forms/:formUUID" element={<FormDetails />} />,
  <Route path="/userGroupDetails/:id" element={<UserGroupDetails />} />
];
