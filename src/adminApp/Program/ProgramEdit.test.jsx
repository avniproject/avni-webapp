import { act } from "react";
import { createRoot } from "react-dom/client";
import ProgramEdit from "./ProgramEdit";
import ProgramService from "../service/ProgramService";
import { saveMessageRules } from "../service/MessageService";

// The real ToolTip imports react-markdown, an ES module Jest here cannot load.
jest.mock("../../common/components/ToolTip", () => ({ ToolTip: () => null }));
jest.mock("react-admin", () => ({ Title: () => null }));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "7" }),
  useNavigate: () => mockNavigate,
}));
jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({ app: { organisationConfig: { enableMessaging: false } } }),
}));

jest.mock("common/utils/httpClient", () => {
  const subjectType = { uuid: "subject-type-uuid", name: "Individual" };
  const responses = {
    "/web/program/7": {
      uuid: "program-uuid",
      name: "Pregnancy",
      programId: 7,
      colour: "#ff0000",
      active: true,
    },
    "/web/operationalModules": {
      forms: [],
      subjectTypes: [subjectType],
      formMappings: [
        { programUUID: "program-uuid", subjectTypeUUID: "subject-type-uuid" },
      ],
    },
  };
  return {
    httpClient: {
      get: (url) => Promise.resolve({ data: responses[url] }),
    },
  };
});

jest.mock("../service/MessageService", () => ({
  getMessageRules: jest.fn(),
  getMessageTemplates: jest.fn(),
  saveMessageRules: jest.fn(() => Promise.resolve()),
}));

jest.mock("../service/ProgramService", () => ({
  __esModule: true,
  default: {
    validateProgram: jest.fn(() => [new Map(), "", ""]),
    updateJSRules: jest.fn(),
    saveProgram: jest.fn(),
  },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const saveButton = () =>
  [...container.querySelectorAll("button")].find(
    (button) => button.textContent.trim().toLowerCase() === "save",
  );

const openAndSave = async () => {
  await act(async () => root.render(<ProgramEdit />));
  await act(async () => saveButton().click());
};

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  mockNavigate.mockClear();
  saveMessageRules.mockClear();
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Saving a program", () => {
  it("stays on the edit screen and says why when the save fails", async () => {
    ProgramService.saveProgram.mockResolvedValue({
      errors: new Map([["SaveProgram", "Unable to reach the server."]]),
    });

    await openAndSave();

    expect(container.textContent).toContain("Unable to reach the server.");
    expect(saveMessageRules).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("saves the message rules and shows the program when the save works", async () => {
    ProgramService.saveProgram.mockResolvedValue({ errors: new Map() });

    await openAndSave();

    expect(saveMessageRules).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/appDesigner/program/7/show");
  });
});
