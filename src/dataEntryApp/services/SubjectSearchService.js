import { httpClient } from "common/utils/httpClient";

class SubjectSearchService {
  static search(searchRequest) {
    const apiUrl = "/web/searchAPI/v2";
    const pageElement = {};
    pageElement.numberOfRecordPerPage = 20;
    searchRequest.pageElement = pageElement;
    return httpClient
      .post(apiUrl, searchRequest)
      .then(response => response.data)
      .then(result => result);
  }
  static searchByUuid(subjectUuid) {
    const apiUrl = `/web/individual/${subjectUuid}`;

    return httpClient
      .get(apiUrl)
      .then(response => response.data)
      .then(result => result);
  }
}

export default SubjectSearchService;
