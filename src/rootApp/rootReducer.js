import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { routerReducer } from "react-router-redux";
import { adminReducer, defaultI18nProvider, i18nReducer } from "react-admin";
import dataEntry from "../dataEntryApp/reducers/dataEntryReducer";
import bulkUpload from "../upload/reducers";
import translations from "../translations/reducers";
import reports from "../reports/reducers";
import userGroups from "../userGroups/reducers";
import app from "./ducks";
import translationsReducer from "../i18nTranslations/TranslationReducers";
import programs from "../dataEntryApp/reducers/programReducer";

const LOCALE = "en";
export default combineReducers({
  admin: adminReducer,
  form: formReducer,
  i18n: i18nReducer(LOCALE, defaultI18nProvider(LOCALE)),
  router: routerReducer,
  app,
  dataEntry,
  bulkUpload,
  translations,
  reports,
  translationsReducer,
  programs,
  userGroups
});
