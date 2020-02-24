import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { store } from "./common/utils/reduxStoreUtilty";
// import translationComp from './TranslationComp'
// import {store} from "../"

// translationComp();
const lang = store.getState().translations;
console.log("fgijsdf-----"+lang);
i18n.use(LanguageDetector).init({
  // we init with resources

  // console.log(lang);
  resources: {
    lang
    // en: {
    //   translations: {
    //     "To get started, edit <1>src/App.js</1> and save to reload.":
    //       "To get started, edit <1>src/App.js</1> and save to reload.",
    //     welcome: "Welcome to React and react-i18next"
    //   }
    // },
    // de: {
    //   translations: {
    //     "To get started, edit <1>src/App.js</1> and save to reload.":
    //       "Starte in dem du, <1>src/App.js</1> editierst und speicherst.",
    //     welcome: "Willkommen bei React und react-i18next"
    //   }
    // }
  },
  fallbackLng: "en",
  debug: true,

  // have a common namespace used around the full app
  ns: ["translations"],
  defaultNS: "translations",

  keySeparator: false, // we use content as keys

  interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ","
  },

  react: {
    wait: true
  }
});

export default i18n;
