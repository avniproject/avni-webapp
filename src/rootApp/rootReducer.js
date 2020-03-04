import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { routerReducer } from "react-router-redux";
import { adminReducer } from "react-admin";
import dataEntry from "../dataEntryApp/reducers/dataEntryReducer";
import bulkUpload from "../upload/reducers";
import translations from "../translations/reducers";
import reports from "../reports/reducers";
import app from "./ducks";
import translationsReducer from "../i18nTranslations/TranslationReducers";

export default combineReducers({
  admin: adminReducer,
  form: formReducer,
  router: routerReducer,
  app,
  dataEntry,
  bulkUpload,
  translations,
  reports,
  translationsReducer
});
