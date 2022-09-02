import api from "../api";

export const fetchSubjectData = query =>
  new Promise(resolve => {
    const searchRequest = {};
    const pageElement = {};
    pageElement.pageNumber = query.page;
    pageElement.numberOfRecordPerPage = query.pageSize;
    searchRequest.pageElement = pageElement;
    api
      .getSubjects(searchRequest)
      .then(response => response.data)
      .then(result => {
        resolve({
          data: result.listOfRecords,
          page: query.page,
          totalCount: result.totalElements
        });
      })
      .catch(err => console.log(err));
  });
