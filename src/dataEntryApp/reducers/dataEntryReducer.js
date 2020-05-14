import { combineReducers } from "redux";
import search from "./searchReducer";
import registration from "./registrationReducer";
import metadata from "./metadataReducer";
import subjectProfile from "./subjectDashboardReducer";
import subjectGenerel from "./generalSubjectDashboardReducer";
import subjectProgram from "./programSubjectDashboardReducer";
import { conceptReducer } from "../../common/store/conceptReducer";
import programs from "./programReducer";
import enrolmentReducer from "./programEnrolReducer";
import programEncounterReducer from "./programEncounterReducer";

export default combineReducers({
  search,
  registration,
  metadata,
  subjectProfile,
  subjectGenerel,
  subjectProgram,
  conceptReducer,
  programs,
  enrolmentReducer,
  programEncounterReducer
});
