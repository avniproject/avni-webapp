import { act } from "react";
import { createRoot } from "react-dom/client";
import OrgManager from "./OrgManager";

let mockState;
jest.mock("react-redux", () => ({
  useSelector: (fn) => fn({ app: mockState }),
  useDispatch: () => jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  Route: () => null,
  useNavigate: () => jest.fn(),
}));
// Resources show as their menu label, so the test sees what the menu would list.
jest.mock("react-admin", () => ({
  Admin: ({ children }) =>
    require("react").createElement("div", null, children),
  CustomRoutes: () => null,
  Resource: ({ options }) =>
    options && options.label
      ? require("react").createElement(
          "span",
          { "data-menu": options.label },
          options.label,
        )
      : null,
}));
jest.mock("./react-admin-config", () => ({}));
jest.mock("./user", () => ({}));
jest.mock("./catchment", () => ({}));
jest.mock("./addressLevelType", () => ({}));
jest.mock("./locations", () => ({}));
jest.mock("./IdentifierSource", () => ({}));
jest.mock("./IdentifierUserAssignment", () => ({}));
jest.mock("./OrganisationConfig", () => () => null);
jest.mock("../common/components/utils", () => ({ WithProps: () => null }));
jest.mock("../upload", () => ({ UploadDashboard: () => null }));
jest.mock("../common/components/AdminLayout", () => () => null);
jest.mock("../rootApp/ducks", () => ({ getAdminOrgs: () => ({}) }));
jest.mock("../userGroups/UserGroups", () => () => null);
jest.mock("./OrganisationDetail", () => ({ OrganisationDetail: () => null }));
jest.mock("../common/utils/httpClient", () => ({
  __esModule: true,
  httpClient: {},
  default: {},
}));
jest.mock("../phoneNumberVerification/Msg91Config", () => () => null);
jest.mock("../common/service/CurrentUserService", () => ({
  isAdminButNotImpersonating: () => false,
}));
jest.mock("./DeploymentManager", () => () => null);
jest.mock("../userGroups/UserGroupDetails", () => () => null);
jest.mock("./components/CreateEditLanguages", () => () => null);

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const editor = {
  privileges: [{ privilegeType: "EditOrganisationConfiguration" }],
};
let container;
let root;
const menu = async (state) => {
  mockState = { organisation: {}, authSession: {}, ...state };
  await act(async () => root.render(<OrgManager />));
  return [...container.querySelectorAll("[data-menu]")].map(
    (e) => e.dataset.menu,
  );
};

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("ABDM menu entry", () => {
  it("is called ABDM and shown with ABHA and record sharing on", async () => {
    const labels = await menu({
      userInfo: editor,
      organisationConfig: { enableAbha: true, enableAbdmRecordSharing: true },
    });
    expect(labels).toContain("ABDM");
    expect(labels.join()).not.toContain("demo");
  });

  it.each([
    [{ enableAbha: true }],
    [{ enableAbdmRecordSharing: true }],
    [{}],
    [undefined],
  ])("is not shown when the organisation config is %j", async (config) => {
    const labels = await menu({ userInfo: editor, organisationConfig: config });
    expect(labels).not.toContain("ABDM");
  });
});
