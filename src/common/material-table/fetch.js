import _ from "lodash";
import http from "../utils/httpClient";

const baseUrl = "/web";

const fetchData = (resourceUrl, params) => query =>
  new Promise(resolve => {
    let searchParams = new URLSearchParams(params);

    let apiUrl = `${baseUrl}${resourceUrl}`;
    searchParams.append("size", query.pageSize);
    searchParams.append("page", query.page);
    if (!_.isEmpty(query.orderBy) && !_.isEmpty(query.orderBy.field))
      searchParams.append("sort", `${query.orderBy.field},${query.orderDirection}`);
    apiUrl += "?" + searchParams.toString();
    http
      .get(apiUrl)
      .then(response => response.data)
      .then(result => {
        let data = [];
        if (result.content) {
          data = result.content;
        }
        resolve({
          data: data,
          page: result.number,
          totalCount: result.numberOfElements
        });
      });
  });

export default fetchData;
