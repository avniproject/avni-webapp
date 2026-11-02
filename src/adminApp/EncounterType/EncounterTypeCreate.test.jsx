/**
 * avniproject/avni-client#1635: App Designer must not save an encounter type name with
 * leading/trailing spaces, and must refuse an all-spaces name as empty.
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import EncounterTypeCreate from "./EncounterTypeCreate";
import { httpClient as http } from "common/utils/httpClient";

jest.mock("../../common/components/ToolTip", () => ({ ToolTip: () => null }));
jest.mock("../../common/components/DocumentationContainer", () => ({
  DocumentationContainer: ({ children }) => <div>{children}</div>,
}));
jest.mock("react-admin", () => ({ Title: () => null }));
jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }));
jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({ app: { organisationConfig: { enableMessaging: false } } }),
}));
jest.mock("../../formDesigner/util", () => ({
  validateRule: () => ({ jsCode: "", validationError: "" }),
}));
jest.mock(
  "../../formDesigner/components/MessageRule/MessageRules",
  () => () => null,
);
jest.mock("../service/MessageService", () => ({
  getMessageTemplates: jest.fn(),
  saveMessageRules: jest.fn(() => Promise.resolve()),
}));
jest.mock("common/utils/httpClient", () => ({
  httpClient: {
    get: jest.fn(() =>
      Promise.resolve({
        data: { formMappings: [], forms: [], subjectTypes: [], programs: [] },
      }),
    ),
    post: jest.fn(() =>
      Promise.resolve({ status: 200, data: { id: 3, encounterTypeId: 3 } }),
    ),
  },
}));

let mockTypedName;
jest.mock("./EditEncounterTypeFields", () => (props) => {
  const { dispatch, setSubjectT } = props;
  require("react").useEffect(() => {
    dispatch({ type: "name", payload: mockTypedName });
    setSubjectT({ uuid: "subject-type-uuid" });
  }, []);
  return null;
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const saveButton = () =>
  [...container.querySelectorAll("button")].find(
    (button) => button.textContent.trim().toLowerCase() === "save",
  );

const typeAndSave = async (name) => {
  mockTypedName = name;
  await act(async () => root.render(<EncounterTypeCreate />));
  await act(async () => saveButton().click());
};

beforeEach(() => {
  http.post.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("EncounterTypeCreate name trimming (#1635)", () => {
  it("POSTs the name without leading/trailing spaces", async () => {
    await typeAndSave("  ANC Visit  ");
    expect(http.post).toHaveBeenCalledTimes(1);
    expect(http.post.mock.calls[0][1].name).toBe("ANC Visit");
  });

  it("refuses an all-spaces name as empty", async () => {
    await typeAndSave("   ");
    expect(http.post).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Empty name is not allowed.");
  });
});
