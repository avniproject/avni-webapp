import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import SubjectDashboard from "./SubjectDashboard";

const mockState = {
  dataEntry: {
    subjectProfile: {},
    subjectGenerel: {},
    subjectProgram: {},
    registration: {},
    msgs: {},
  },
};

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector) => selector(mockState),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock("dataEntryApp/components/Breadcrumbs", () => () => null);
jest.mock("./components/ProfileDetails", () => () => (
  <div data-testid="profile-details" />
));
jest.mock("./components/SubjectDashboardTabs", () => () => null);

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("SubjectDashboard", () => {
  let container;
  let root;

  const render = async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () =>
      root.render(
        <MemoryRouter
          initialEntries={[
            "/app/subject?uuid=00000000-0000-0000-0000-000000001079",
          ]}
        >
          <SubjectDashboard />
        </MemoryRouter>,
      ),
    );
  };

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("says the subject was not found when the server does not know the uuid", async () => {
    mockState.dataEntry.subjectProfile = {
      notFoundSubjectUuid: "00000000-0000-0000-0000-000000001079",
      dashboardLoaded: true,
    };
    await render();

    expect(
      container.querySelector("[data-testid='subject-not-found']").textContent,
    ).toBe("subjectNotFound");
    expect(
      container.querySelector("[data-testid='profile-details']"),
    ).toBeNull();
  });

  it("shows the profile when a different subject was not found earlier", async () => {
    mockState.dataEntry.subjectProfile = {
      notFoundSubjectUuid: "another-subject",
      subjectProfile: { uuid: "s1" },
      dashboardLoaded: true,
    };
    await render();

    expect(
      container.querySelector("[data-testid='subject-not-found']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='profile-details']"),
    ).not.toBeNull();
  });
});
