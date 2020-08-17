import { httpClient } from "common/utils/httpClient";

export default {
  search({ name, subjectTypeUUID, ...params }) {
    const _params = {
      page: 0,
      size: 10,
      ...params
    };
    return httpClient
      .fetchJson(httpClient.withParams("/individual/search", { name, subjectTypeUUID, ..._params }))
      .then(res => res.json);
  }
};
