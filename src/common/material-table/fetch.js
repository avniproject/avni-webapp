import _ from "lodash";
import { httpClient as http } from "../utils/httpClient";

const baseUrl = "/web";

const fetchData = (resourceName, resourceUrl, params) => query =>
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
        resolve({
          data: result._embedded ? result._embedded[resourceName] : [],
          page: result.page.number,
          totalCount: result.page.totalElements
        });
      });
  });

export default fetchData;
