import { combineReducers } from "redux";
import search from "./searchReducer";
import registration from "./registrationReducer";
import metadata from "./metadataReducer";
import subjectProfile from "./subjectDashboardReducer";

export default combineReducers({
  search,
  registration,
  metadata,
  subjectProfile
});
