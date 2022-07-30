import http from "common/utils/httpClient";
import _, { get, mapValues } from "lodash";

export const fetchTasks = (query, filterCriteria) => {
  const filterCriteriaValues = mapValues(filterCriteria, value => get(value, "value", null));
  return new Promise(resolve => {
    let apiUrl = "/web/task?";
    apiUrl += "size=" + query.pageSize;
    apiUrl += "&page=" + query.page;
    if (!_.isEmpty(query.orderBy)) {
      apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
    }
    http
      .post(apiUrl, filterCriteriaValues)
      .then(response => response.data)
      .then(result => {
        resolve({
          data: result.content,
          page: query.page,
          totalCount: result.numberOfElements
        });
      })
      .catch(err => console.log(err));
  });
};
