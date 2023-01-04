import { httpClient } from "common/utils/httpClient";

export default {
  search(searchRequest) {
    const apiUrl = "/web/searchAPI/v2";
    const pageElement = {};
    pageElement.numberOfRecordPerPage = 20;
    searchRequest.pageElement = pageElement;
    return httpClient
      .post(apiUrl, searchRequest)
      .then(response => response.data)
      .then(result => result);
  }
};
