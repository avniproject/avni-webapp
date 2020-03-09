import { combineReducers } from "redux";
import search from "./searchReducer";
import registration from "./registrationReducer";
import metadata from "./metadataReducer";
import subjectProfile from "./subjectDashboardReducer";
import subjectGenerel from "./generalSubjectDashboardReducer";
import subjectProgram from "./programSubjectDashboardReducer";
import { conceptReducer } from "../../common/store/conceptReducer";
import orgConfig from "../../rootApp/ducks";
import userInfo from "../../rootApp/ducks";

export default combineReducers({
  search,
  registration,
  metadata,
  subjectProfile,
  subjectGenerel,
  subjectProgram,
  conceptReducer,
  orgConfig,
  userInfo
});
