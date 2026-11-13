import { act } from "react";
import { createRoot } from "react-dom/client";
import { httpClient } from "common/utils/httpClient";
import SubjectSearchTable, { oneEnrolmentPerProgram } from "./SubjectSearchTable";
import { extensionScopeTypes } from "../../../formDesigner/components/Extensions/ExtensionReducer";

jest.mock("react-redux", () => {
  const subjectTypes = [
    { uuid: "st-person", name: "Individual", type: "Person" },
  ];
  return {
    useDispatch: () => jest.fn(),
    useSelector: () => subjectTypes,
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en", t: (key) => key },
  }),
}));

jest.mock("common/utils/httpClient", () => ({
  httpClient: { post: jest.fn() },
}));

jest.mock("../../components/SubjectProfilePicture", () => () => null);

jest.mock("../subjectDashBoard/components/extension/ExtensionOption", () => ({
  ExtensionOption: () => null,
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

beforeEach(async () => {
  httpClient.post.mockReset();
  httpClient.post.mockResolvedValue({
    data: {
      listOfRecords: [
        {
          uuid: "s1",
          fullName: "Asha",
          gender: "Female",
          dateOfBirth: "1990-04-10",
        },
      ],
      totalElements: 1,
    },
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () =>
    root.render(
      <SubjectSearchTable
        searchRequest={{ subjectType: "st-person" }}
        organisationConfigs={{}}
      />,
    ),
  );
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const lastPageElement = () => httpClient.post.mock.calls.at(-1)[1].pageElement;

const clickSortOn = async (header) => {
  const headerCell = [...container.querySelectorAll("th")].find((th) =>
    th.textContent.includes(header),
  );
  const sortButton = headerCell.querySelector(
    "[aria-label^='Sort'], .MuiTableSortLabel-root",
  );
  await act(async () => sortButton.click());
};

describe("SubjectSearchTable searching", () => {
  it("searches once when the results page opens", () => {
    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });

  it("searches once more when sorted", async () => {
    await clickSortOn("name");

    expect(httpClient.post).toHaveBeenCalledTimes(2);
  });
});

describe("SubjectSearchTable sorting", () => {
  it("asks the server to sort by age, not date of birth, in the direction chosen", async () => {
    await clickSortOn("age");
    expect(lastPageElement()).toMatchObject({
      sortColumn: "age",
      sortOrder: "asc",
    });

    await clickSortOn("age");
    expect(lastPageElement()).toMatchObject({
      sortColumn: "age",
      sortOrder: "desc",
    });
  });

  it("keeps the page when sorting by age", async () => {
    await clickSortOn("age");
    expect(lastPageElement()).toMatchObject({
      pageNumber: 0,
      numberOfRecordPerPage: 10,
    });
  });

  it("sorts by name and gender with their own columns as before", async () => {
    await clickSortOn("name");
    expect(lastPageElement()).toMatchObject({
      sortColumn: "fullName",
      sortOrder: "asc",
    });

    await clickSortOn("gender");
    expect(lastPageElement()).toMatchObject({
      sortColumn: "gender",
      sortOrder: "asc",
    });
  });
});

describe("SubjectSearchTable request", () => {
  const lastRequest = () => httpClient.post.mock.calls.at(-1)[1];
  const renderWith = async (
    searchRequest,
    organisationConfigs,
    organisationConfigsFailed,
  ) => {
    httpClient.post.mockClear();
    await act(async () =>
      root.render(
        <SubjectSearchTable
          searchRequest={searchRequest}
          organisationConfigs={organisationConfigs}
          organisationConfigsFailed={organisationConfigsFailed}
        />,
      ),
    );
  };
  const textConcept = (uuid) => ({
    uuid,
    searchScope: "registration",
    dataType: "Text",
    widget: "Default",
    value: "x",
  });
  const configsWithConceptFilter = {
    organisationConfig: {
      searchFilters: [
        {
          type: "Concept",
          subjectTypeUUID: "st-person",
          conceptUUID: "still-configured",
        },
      ],
    },
  };

  it("sends the user's time zone", () => {
    expect(lastRequest().timeZone).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  });

  it("ignores a saved search for a subject type the user does not have", async () => {
    await renderWith(
      { subjectType: "other-org-subject-type", name: "Asha" },
      configsWithConceptFilter,
    );

    expect(lastRequest().subjectType).toBe("st-person");
    expect(lastRequest().name).toBeUndefined();
  });

  it("drops saved concept filters that are no longer configured", async () => {
    await renderWith(
      {
        subjectType: "st-person",
        concept: [textConcept("still-configured"), textConcept("removed")],
      },
      configsWithConceptFilter,
    );

    expect(lastRequest().concept.map(({ uuid }) => uuid)).toEqual([
      "still-configured",
    ]);
  });

  it("waits for the search filter configuration before searching with saved concept filters", async () => {
    await renderWith(
      { subjectType: "st-person", concept: [textConcept("removed")] },
      undefined,
    );

    expect(httpClient.post).not.toHaveBeenCalled();
  });

  it("says something went wrong when the search filter configuration fails to load", async () => {
    await renderWith(
      { subjectType: "st-person", concept: [textConcept("still-configured")] },
      undefined,
      true,
    );

    expect(httpClient.post).not.toHaveBeenCalled();
    expect(container.textContent).toContain("somethingWentWrong");
  });

  it("still searches when the configuration fails but the saved search does not need it", async () => {
    await renderWith({ subjectType: "st-person", name: "Asha" }, undefined, true);

    expect(lastRequest().name).toBe("Asha");
    expect(container.textContent).not.toContain("somethingWentWrong");
  });
});

describe("SubjectSearchTable enrolments", () => {
  const active = (name) => ({ operationalProgramName: name, programColor: "#123456" });
  const exited = (name) => ({
    operationalProgramName: name,
    programColor: "#123456",
    programExitDateTime: "2026-11-01T10:00:00.000Z",
  });

  const showEnrolments = async (enrolments) => {
    httpClient.post.mockResolvedValue({
      data: {
        listOfRecords: [{ uuid: "s2", fullName: "Bina", enrolments }],
        totalElements: 1,
      },
    });
    await act(async () =>
      root.render(
        <SubjectSearchTable
          searchRequest={{ subjectType: "st-person", name: "Bina" }}
          organisationConfigs={{}}
        />,
      ),
    );
    return [...container.querySelectorAll(".MuiChip-root")].map((chip) => chip.textContent);
  };

  it("tags an exited enrolment's programme as exited and leaves an active one as it was", async () => {
    expect(await showEnrolments([active("Child"), exited("Pregnancy")])).toEqual([
      "Child",
      "Pregnancy · exitedEnrolment",
    ]);
  });

  it("shows the active enrolment when the subject exited and enrolled again in the same programme", async () => {
    expect(await showEnrolments([exited("Child"), active("Child")])).toEqual(["Child"]);
  });

  it("shows one exited chip for a programme exited more than once", () => {
    expect(oneEnrolmentPerProgram([exited("Child"), exited("Child")])).toHaveLength(1);
  });
});

describe("SubjectSearchTable result columns", () => {
  const createdByName = (subjectTypeUUID) => ({
    subjectTypeUUID,
    searchResultConcepts: [{ name: "Created By Name" }],
  });
  const headers = () =>
    [...container.querySelectorAll("th")].map((th) => th.textContent.trim()).filter((text) => text);
  const renderWith = async (searchRequest, organisationConfigs) =>
    act(async () =>
      root.render(
        <SubjectSearchTable searchRequest={searchRequest} organisationConfigs={organisationConfigs} />,
      ),
    );

  it("shows a result field set on more than one subject type once before a subject type is chosen", async () => {
    await renderWith(
      { name: "Asha" },
      { organisationConfig: { searchResultFields: [createdByName("st-person"), createdByName("st-group")] } },
    );
    expect(headers().filter((header) => header.startsWith("Created By Name"))).toHaveLength(1);
  });

  it("keeps a result field next to the name when the organisation settings arrive after the table is shown", async () => {
    await renderWith({ subjectType: "st-person" }, {});
    await renderWith(
      { subjectType: "st-person" },
      { organisationConfig: { searchResultFields: [createdByName("st-person")] } },
    );
    expect(headers()[0]).toMatch(/^name/);
    expect(headers()[1]).toMatch(/^Created By Name/);
  });

  it("keeps the selection tick box first when search result extensions are configured", async () => {
    const extensions = [{ extensionScope: { scopeType: extensionScopeTypes.searchResults } }];
    await renderWith({ subjectType: "st-person" }, { organisationConfig: { extensions } });
    await renderWith(
      { subjectType: "st-person" },
      { organisationConfig: { extensions, searchResultFields: [createdByName("st-person")] } },
    );
    const headerCells = [...container.querySelectorAll("th")];
    expect(headerCells[0].querySelector("input[type='checkbox']")).not.toBeNull();
    expect(headerCells[1].textContent).toMatch(/^name/);
    expect(headerCells[2].textContent).toMatch(/^Created By Name/);
  });
});

describe("SubjectSearchTable page and sort after a refresh", () => {
  const tableKey = "avni.dataEntry.searchRequest.resultsTable";
  const savedTable = () => JSON.parse(sessionStorage.getItem(tableKey));
  const refreshWith = async (table) => {
    await act(async () => root.unmount());
    sessionStorage.setItem("avni.dataEntry.searchRequest", JSON.stringify({ subjectType: "st-person" }));
    if (table) sessionStorage.setItem(tableKey, JSON.stringify(table));
    httpClient.post.mockClear();
    root = createRoot(container);
    await act(async () =>
      root.render(<SubjectSearchTable searchRequest={{ subjectType: "st-person" }} organisationConfigs={{}} />),
    );
  };

  afterEach(() => sessionStorage.clear());

  it("searches with the saved page, rows per page and sort", async () => {
    await refreshWith({ pagination: { pageIndex: 1, pageSize: 20 }, sorting: [{ id: "fullName", desc: true }] });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(lastPageElement()).toEqual({
      pageNumber: 1,
      numberOfRecordPerPage: 20,
      sortColumn: "fullName",
      sortOrder: "desc",
    });
  });

  it("shows the saved sort on the column", async () => {
    await refreshWith({ pagination: { pageIndex: 0, pageSize: 10 }, sorting: [{ id: "fullName", desc: true }] });

    const nameHeader = [...container.querySelectorAll("th")].find((th) => th.textContent.includes("name"));
    expect(nameHeader.querySelector(".MuiTableSortLabel-root").getAttribute("aria-label")).toBe(
      "Sorted by name descending",
    );
  });

  it("saves the sort chosen so a refresh keeps it", async () => {
    await refreshWith();
    await clickSortOn("age");

    expect(savedTable().sorting).toEqual([{ id: "age", desc: false }]);
  });

  it("goes back to page 1 when the saved page has no results any more", async () => {
    httpClient.post.mockImplementation((url, request) =>
      Promise.resolve({
        data: {
          listOfRecords: request.pageElement.pageNumber > 0 ? [] : [{ uuid: "s1", fullName: "Asha" }],
          totalElements: 1,
        },
      }),
    );
    await refreshWith({ pagination: { pageIndex: 3, pageSize: 10 }, sorting: [] });

    expect(lastPageElement().pageNumber).toBe(0);
    expect(container.textContent).toContain("Asha");
    expect(savedTable().pagination.pageIndex).toBe(0);
  });
});

describe("SubjectSearchTable without Display Count", () => {
  const pageOf = (pageNumber) =>
    pageNumber > 1
      ? []
      : Array.from({ length: 10 }, (_, i) => ({ uuid: `s${pageNumber}-${i}`, fullName: `Person ${pageNumber * 10 + i + 1}` }));
  const pagesAsked = () => httpClient.post.mock.calls.map((call) => call[1].pageElement.pageNumber);
  const goToNextPage = async () => {
    const next = container.querySelector("[aria-label='Go to next page']");
    await act(async () => next.click());
  };
  const label = () =>
    [...container.querySelectorAll(".MuiTypography-root")].map((el) => el.textContent).find((text) => / of /.test(text));

  beforeEach(async () => {
    await act(async () => root.unmount());
    httpClient.post.mockReset();
    httpClient.post.mockImplementation((url, request) =>
      Promise.resolve({ data: { listOfRecords: pageOf(request.pageElement.pageNumber), totalElements: -1 } }),
    );
    root = createRoot(container);
    await act(async () =>
      root.render(<SubjectSearchTable searchRequest={{ subjectType: "st-person" }} organisationConfigs={{}} />),
    );
  });

  it("stays on the last page and stops offering Next when Next finds no more results", async () => {
    await goToNextPage();
    expect(label()).toBe("11-20 of more than 20");

    await goToNextPage();

    expect(pagesAsked()).toEqual([0, 1, 2, 1]);
    expect(label()).toBe("11-20 of 20");
    expect(container.textContent).toContain("Person 20");
    expect(container.querySelector("[aria-label='Go to page 3']")).toBeNull();
  });

  it("offers Next again after the rows per page change", async () => {
    await goToNextPage();
    await goToNextPage();
    expect(label()).toBe("11-20 of 20");

    const select = container.querySelector(".MuiSelect-select");
    await act(async () => {
      select.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    const option15 = [...document.querySelectorAll("li[role='option']")].find((li) => li.textContent === "15");
    await act(async () => option15.click());

    expect(httpClient.post.mock.calls.at(-1)[1].pageElement).toMatchObject({ pageNumber: 0, numberOfRecordPerPage: 15 });
  });
});
