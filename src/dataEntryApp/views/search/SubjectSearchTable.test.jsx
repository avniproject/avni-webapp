import React, { act } from "react";
import { createRoot } from "react-dom/client";
import SubjectSearchTable from "./SubjectSearchTable";
import {
  loadSearchPaging,
  saveSearchPaging,
} from "../../reducers/searchFilterReducer";
import { httpClient } from "common/utils/httpClient";

jest.mock("common/utils/httpClient", () => ({
  httpClient: { post: jest.fn() },
}));
const mockSubjectTypes = [
  { uuid: "subject-type-uuid", name: "Individual", type: "Person" },
];
jest.mock("react-redux", () => ({
  useSelector: () => mockSubjectTypes,
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key, i18n: {} }),
}));
jest.mock("../../components/SubjectProfilePicture", () => () => null);
jest.mock("../subjectDashBoard/components/extension/ExtensionOption", () => ({
  ExtensionOption: () => null,
}));

global.IS_REACT_ACT_ENVIRONMENT = true;

const searchRequest = {
  subjectType: "subject-type-uuid",
  name: "zz502b",
  includeVoided: false,
  includeDisplayCount: false,
};

const tenRecords = Array.from({ length: 10 }, (_, i) => ({
  uuid: `uuid-${i}`,
  fullName: `Subject ${i}`,
}));

// #502: coming Back from a subject mounts the table again with the page that was saved. The table
// starts with no rows, and material-react-table moves a page that looks out of range back to the
// first page. This test mounts the real table, as Back does, and checks the saved page survives.
describe("SubjectSearchTable, Back from a subject (#502)", () => {
  let container;
  let root;

  beforeEach(() => {
    sessionStorage.clear();
    httpClient.post.mockReset();
    // the server does not count when "Display Count" is off: totalElements is -1
    httpClient.post.mockResolvedValue({
      data: { totalElements: -1, listOfRecords: tenRecords },
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("opens on the saved page and sort, and keeps them", async () => {
    saveSearchPaging(searchRequest, { pageIndex: 1, pageSize: 10 }, [
      { id: "fullName", desc: true },
    ]);

    await act(async () => {
      root.render(
        <SubjectSearchTable
          searchRequest={searchRequest}
          organisationConfigs={{}}
        />,
      );
    });

    const pagesAsked = httpClient.post.mock.calls.map(
      ([, body]) => body.pageElement.pageNumber,
    );
    expect(pagesAsked).not.toContain(0);
    expect(httpClient.post).toHaveBeenLastCalledWith(
      "/web/searchAPI/v2",
      expect.objectContaining({
        pageElement: expect.objectContaining({
          pageNumber: 1,
          sortColumn: "fullName",
          sortOrder: "desc",
        }),
      }),
    );
    expect(loadSearchPaging(searchRequest)).toEqual({
      pagination: { pageIndex: 1, pageSize: 10 },
      sorting: [{ id: "fullName", desc: true }],
    });
  });

  it("also keeps the page when the server gives a total count", async () => {
    httpClient.post.mockResolvedValue({
      data: { totalElements: 26, listOfRecords: tenRecords },
    });
    saveSearchPaging(searchRequest, { pageIndex: 2, pageSize: 10 }, []);

    await act(async () => {
      root.render(
        <SubjectSearchTable
          searchRequest={searchRequest}
          organisationConfigs={{}}
        />,
      );
    });

    expect(loadSearchPaging(searchRequest).pagination).toEqual({
      pageIndex: 2,
      pageSize: 10,
    });
    expect(httpClient.post).toHaveBeenLastCalledWith(
      "/web/searchAPI/v2",
      expect.objectContaining({
        pageElement: expect.objectContaining({ pageNumber: 2 }),
      }),
    );
  });
});
