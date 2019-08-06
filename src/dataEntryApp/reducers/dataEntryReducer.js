import { combineReducers } from "redux";
import search from "./searchReducer";
import subject from "./subjectReducer";
import metadata from "./metadataReducer";

export default combineReducers({
  search,
  subject,
  metadata
});
