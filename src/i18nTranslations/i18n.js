import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import httpClient from "common/utils/httpClient";
let defaultLanguage;
let translationData;
httpClient.fetchJson(`/me`).then(response => {
  defaultLanguage = response.json;
httpClient.fetchJson(`/web/translations`).then(response => {
  translationData = response.json;
  i18n.use(LanguageDetector).init({
    resources: translationData,
    fallbackLng: "en",
    lng:defaultLanguage.settings.locale,
    debug: true,
    ns: ["translations"],
    defaultNS: "translations",
    keySeparator: false, 
    interpolation: {
      escapeValue: false, 
      formatSeparator: ","
    },
    react: {
      wait: true
    }
  });
})
 })
 export default(i18n);


