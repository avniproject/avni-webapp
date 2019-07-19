import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { routerReducer } from "react-router-redux";
import { adminReducer, defaultI18nProvider, i18nReducer } from "react-admin";

import app from "./ducks";

const LOCALE = "en";

export default combineReducers({
  admin: adminReducer,
  i18n: i18nReducer(LOCALE, defaultI18nProvider(LOCALE)),
  form: formReducer,
  router: routerReducer,
  app
});
