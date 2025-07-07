import { httpClient as http } from "../../common/utils/httpClient";

const NEWS_API_ENDPOINT = "/web/news";
export default {
  getNews: () => http.fetchJson(NEWS_API_ENDPOINT).then(response => response.json),
  getNewsById: id => http.get(`${NEWS_API_ENDPOINT}/${id}`),
  createNews: news => http.post(NEWS_API_ENDPOINT, news),
  editNews: news => http.put(`${NEWS_API_ENDPOINT}/${news.id}`, news),
  deleteNews: id => http.delete(`${NEWS_API_ENDPOINT}/${id}`),
  getPublishedNews: () => http.fetchJson("/web/publishedNews").then(response => response.json)
};
