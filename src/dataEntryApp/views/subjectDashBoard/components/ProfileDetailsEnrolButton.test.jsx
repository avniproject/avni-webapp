import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import ProfileDetails from "./ProfileDetails";

const mockState = {
  app: { userInfo: {} },
  dataEntry: {
    programs: { programs: [{ name: "QA Program", uuid: "qa-program" }] },
    loadReducer: { load: true },
    subjectProfile: { tabsStatus: { showProgramTab: true } },
    metadata: { organisationConfigs: {} },
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
jest.mock("../../../sagas/selectors", () => ({ selectOrganisationConfig: () => ({}) }));
jest.mock("../../../components/SubjectProfilePicture", () => () => null);
jest.mock("./extension/ExtensionOption", () => ({ ExtensionOption: () => null }));
jest.mock("./comments/CommentDrawer", () => ({ CommentDrawer: () => null }));
jest.mock("../../../components/CustomizedBackdrop", () => () => null);
jest.mock("./CommonModal", () => () => <div data-testid="enrol-modal" />);
jest.mock("../../../../common/model/UserInfo", () => ({ hasPrivilegeForSubjectType: () => true }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const profile = (voided) => ({
  uuid: "subject",
  voided,
  nameString: "Asha",
  firstName: "Asha",
  lowestAddressLevel: { titleLineage: "QA Village A" },
  subjectType: { uuid: "person", name: "Person", isGroup: () => false, isPerson: () => false },
});

describe("Enrol button with one eligible program", () => {
  let container;
  let root;

  const render = async (voided) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () =>
      root.render(
        <MemoryRouter>
          <ProfileDetails profileDetails={profile(voided)} subjectUuid="subject" />
        </MemoryRouter>,
      ),
    );
  };

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("is shown for an active subject", async () => {
    await render(false);
    expect(container.querySelector("[id='QA Program']")).not.toBeNull();
  });

  it("is not shown for a voided subject", async () => {
    await render(true);
    expect(container.querySelector("[id='QA Program']")).toBeNull();
    expect(container.querySelector("[data-testid='enrol-modal']")).toBeNull();
  });
});
