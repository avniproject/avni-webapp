import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import NewGeneralVisit from "./subjectDashBoard/components/NewGeneralVisit";
import Encounter from "./subjectDashBoard/components/Encounter";
import ProgramEnrol from "./subjectDashBoard/components/ProgramEnrol";
import SubjectRegister from "./registration/SubjectRegister";

const unknown = "00000000-0000-0000-0000-000000001079";
const mockState = {
  app: { authSession: {}, organisationConfig: {} },
  dataEntry: {
    subjectProfile: {},
    metadata: {
      operationalModules: { encounterTypes: [] },
      genders: [],
      organisationConfigs: {},
    },
    encounterReducer: {},
    enrolmentReducer: { load: false },
    loadReducer: { load: false },
    registration: {},
    addressLevelType: {},
  },
};

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector) => {
    try {
      return selector(mockState);
    } catch {
      return undefined;
    }
  },
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: "en" } }),
}));
jest.mock("dataEntryApp/components/Breadcrumbs", () => () => null);

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const pages = [
  [
    "new visit list",
    NewGeneralVisit,
    `/app/subject/newGeneralVisit?subjectUuid=${unknown}`,
  ],
  [
    "new visit form",
    Encounter,
    `/app/subject/encounter?subjectUuid=${unknown}&uuid=visit-type`,
  ],
  [
    "enrol in program",
    ProgramEnrol,
    `/app/subject/enrol?uuid=${unknown}&programName=Pregnancy&formType=ProgramEnrolment&subjectTypeName=Person`,
  ],
  ["edit registration", SubjectRegister, `/app/editSubject?uuid=${unknown}`],
];

describe.each(pages)("%s", (name, Page, url) => {
  let container;
  let root;

  const render = async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () =>
      root.render(
        <MemoryRouter initialEntries={[url]}>
          <Page />
        </MemoryRouter>,
      ),
    );
  };

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("says the subject was not found", async () => {
    mockState.dataEntry.subjectProfile = { notFoundSubjectUuid: unknown };
    await render();

    expect(
      container.querySelector("[data-testid='subject-not-found']")?.textContent,
    ).toBe("subjectNotFound");
  });

  it("does not say so because a different subject was not found earlier", async () => {
    mockState.dataEntry.subjectProfile = {
      notFoundSubjectUuid: "another-subject",
    };
    await render();

    expect(
      container.querySelector("[data-testid='subject-not-found']"),
    ).toBeNull();
  });
});
