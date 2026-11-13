import { act } from "react";
import { createRoot } from "react-dom/client";
import { httpClient } from "common/utils/httpClient";
import CustomFilters from "./CustomFilters";

jest.mock("react-admin", () => ({ Title: () => null }));
jest.mock("react-redux", () => ({
  useSelector: selector => selector({ app: { userInfo: { privileges: [] } }, reports: { operationalModules: {} } }),
  useDispatch: () => jest.fn()
}));
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/appdesigner/searchFilters" })
}));
jest.mock("common/utils/httpClient", () => ({ httpClient: { get: jest.fn() } }));
jest.mock("../reports/reducers", () => ({ getOperationalModules: () => ({ type: "noop" }) }));
jest.mock("../common/service", () => ({ __esModule: true, default: { fetchSubjectTypes: jest.fn().mockResolvedValue([]) } }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const searchFilters = [
  { titleKey: "Age", type: "Age" },
  { titleKey: "Caste", type: "Concept", conceptName: "Caste" },
  { titleKey: "Block", type: "Concept", conceptName: "Block" }
];

const firstColumnValues = () => [...container.querySelectorAll("tbody tr")].map(row => row.querySelectorAll("td")[0].textContent);

describe("Search Filters list", () => {
  it("Concept Name sorts ascending on the first click even when the first filter has no concept", async () => {
    httpClient.get.mockResolvedValue({
      data: { _embedded: { organisationConfig: [{ organisationId: 1, uuid: "u", settings: { searchFilters } }] } }
    });
    await act(async () => root.render(<CustomFilters organisation={{ id: 1 }} />));
    const conceptHeader = [...container.querySelectorAll("th")].find(th => th.textContent.includes("Concept Name"));

    await act(async () => conceptHeader.querySelector(".MuiTableSortLabel-root").click());

    expect(conceptHeader.querySelector(".MuiTableSortLabel-root").getAttribute("aria-label")).toBe("Sorted by Concept Name ascending");
  });
});
