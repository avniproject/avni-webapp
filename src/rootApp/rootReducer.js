import { combineReducers } from "redux";
import dataEntry from "../dataEntryApp/reducers/dataEntryReducer";
import broadcast from "../news/reducers/metadataReducer";
import bulkUpload from "../upload/reducers";
import translations from "../translations/reducers";
import reports from "../reports/reducers";
import userGroups from "../userGroups/reducers";
import app from "./ducks";
import translationsReducer from "../i18nTranslations/TranslationReducers";
import programs from "../dataEntryApp/reducers/programReducer";
import sagaErrorState from "./SagaErrorReducer";

const createRootReducer = routerReducer =>
  combineReducers({
    app,
    dataEntry,
    broadcast,
    bulkUpload,
    translations,
    reports,
    translationsReducer,
    programs,
    userGroups,
    sagaErrorState,
    router: routerReducer
  });

export default createRootReducer;
