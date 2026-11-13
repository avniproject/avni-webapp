import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import SearchFilterFormContainer from "./SearchFilterForm";

const mockState = {
  dataEntry: {
    metadata: {
      operationalModules: { subjectTypes: [] },
      genders: [],
      organisationConfigs: undefined,
      organisationConfigsFailed: true,
    },
    searchFilterReducer: { request: {} },
  },
};

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector) => selector(mockState),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en", t: (key) => key },
  }),
}));

jest.mock("dataEntryApp/components/Breadcrumbs", () => () => (
  <nav data-testid="breadcrumbs" />
));

jest.mock("../../../common/store", () => ({ store: { dispatch: jest.fn() } }));

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

describe("SearchFilterFormContainer when the organisation configuration fails to load", () => {
  it("shows the error in the page, under the breadcrumbs like the search form", async () => {
    await act(async () =>
      root.render(
        <MemoryRouter initialEntries={["/app/searchFilter"]}>
          <SearchFilterFormContainer />
        </MemoryRouter>,
      ),
    );

    const alert = container.querySelector("[role='alert']");
    expect(alert.textContent).toBe("somethingWentWrong");
    expect(container.querySelector("[data-testid='breadcrumbs']")).not.toBeNull();
    expect(alert.closest(".MuiPaper-root")).not.toBeNull();
  });
});
