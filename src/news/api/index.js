import httpClient from "common/utils/httpClient";

const NEWS_API_ENDPOINT = "/web/news";
export default {
  getNews: () => httpClient.fetchJson(NEWS_API_ENDPOINT).then(response => response.json)
  // getNewsById : id => {},
  // createNews : news => {},
  // editNews : news => {},
  // publishNews : news => {},
  // deleteNews : id => {},
};
