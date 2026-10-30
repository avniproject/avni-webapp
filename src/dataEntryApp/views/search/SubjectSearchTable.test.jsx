import { act } from "react";
import { createRoot } from "react-dom/client";
import { httpClient } from "common/utils/httpClient";
import SubjectSearchTable from "./SubjectSearchTable";

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
