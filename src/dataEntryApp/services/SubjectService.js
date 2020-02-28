import { httpClient } from "common/utils/httpClient";

export default {
  search(params) {
    const _params = {
      page: 0,
      size: 20,
      ...params
    };
    return httpClient
      .fetchJson(httpClient.withParams("/individual/search", _params))
      .then(res => res.json.content);
  }
};
