// import httpClient from "common/utils/httpClient";

// let lang;
// httpClient.fetchJson(`/web/translations?locale=mr_IN`).then(response => {
//   lang = response.json;

import { httpClient } from "common/utils/httpClient";
export default {
  fetchTranslationDetails: () =>
    httpClient.fetchJson(`/web/translations`).then(response => {
      return response.json;
    }),
  fetchOrganisationConfig: () =>
    httpClient.fetchJson("/web/organizations").then(response => response.json)
};
