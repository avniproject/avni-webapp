import { combineReducers } from "redux";
import search from "./searchReducer";
import registration from "./registrationReducer";
import metadata from "./metadataReducer";

export default combineReducers({
  search,
  registration,
  metadata
});
