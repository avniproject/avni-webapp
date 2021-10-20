import _ from "lodash";
import http from "../utils/httpClient";

const baseUrl = "/web";

const fetchData = resourceUrl => query =>
  new Promise(resolve => {
    let apiUrl = `${baseUrl}${resourceUrl}`;
    apiUrl += "?size=" + query.pageSize;
    apiUrl += "&page=" + query.page;
    if (!_.isEmpty(query.orderBy) && !_.isEmpty(query.orderBy.field))
      apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
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
