import { Route } from "react-router-dom";
import CreateEditLanguages from "./components/CreateEditLanguages";
import CreateEditFiltersHOC from "./components/CreateEditFiltersHOC";
import FormDetails from "../formDesigner/views/FormDetails";
import CreateEditConcept from "../formDesigner/views/CreateEditConcept";
import UserGroupDetails from "../userGroups/UserGroupDetails";

const CreateConcept = () => <CreateEditConcept isCreatePage={true} />;

export default [
  <Route exact path="/editLanguages" component={CreateEditLanguages} />,
  <Route exact path="/filters" component={CreateEditFiltersHOC} />,
  <Route exact path="/forms/:formUUID" component={FormDetails} />,
  <Route exact path="/userGroupDetails/:id" component={UserGroupDetails} />
];
