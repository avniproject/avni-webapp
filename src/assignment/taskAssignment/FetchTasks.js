import { httpClient as http } from "common/utils/httpClient";
import { getFilterPayload } from "../reducers/TaskAssignmentReducer";
import { isEmpty } from "lodash";

export const fetchTasks = (query, filterCriteria) => {
  return new Promise(resolve => {
    let apiUrl = "/web/task?";
    apiUrl += "size=" + query.pageSize;
    apiUrl += "&page=" + query.page;
    if (!isEmpty(query.orderBy)) {
      apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
    }
    http
      .post(apiUrl, getFilterPayload(filterCriteria))
      .then(response => response.data)
      .then(result => {
        resolve({
          data: result.content,
          page: query.page,
          totalCount: result.totalElements
        });
      });
  });
};
