import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import httpClient from "common/utils/httpClient";

let translationData;
httpClient.fetchJson(`/web/translations`).then(response => {
  translationData = response.json;
  i18n.use(LanguageDetector).init({
    resources: translationData,
    fallbackLng: "en",
    debug: true,
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

})
export default i18n;