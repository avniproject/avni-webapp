import { act } from "react";
import { createRoot } from "react-dom/client";
import CreateEditConcept from "./CreateEditConcept";
import ConceptService from "../../common/service/ConceptService";

// The real ToolTip imports react-markdown, an ES module Jest here cannot load.
jest.mock("../../common/components/ToolTip", () => ({ ToolTip: () => null }));
jest.mock("../../common/components/DocumentationContainer", () => ({
  DocumentationContainer: ({ children }) => children,
}));
jest.mock("react-admin", () => ({ Title: () => null }));
jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({
      app: { userInfo: { hasAllPrivileges: true }, organisation: { id: 1 } },
    }),
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ uuid: "concept-uuid" }),
  Navigate: () => null,
}));
jest.mock("common/utils/httpClient", () => ({
  httpClient: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    delete: jest.fn(),
  },
}));
jest.mock("../../common/service/ConceptService", () => ({
  __esModule: true,
  default: { getConcept: jest.fn(), saveConcept: jest.fn() },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const savedConcept = (keyValues) => ({
  uuid: "concept-uuid",
  name: "AI verdict",
  dataType: "Text",
  active: true,
  keyValues,
  answers: [],
  media: [],
  organisationId: 1,
});

const openConcept = async (keyValues) => {
  ConceptService.getConcept.mockResolvedValue(savedConcept(keyValues));
  ConceptService.saveConcept.mockImplementation(async (concept) => ({
    concept,
  }));
  await act(async () => root.render(<CreateEditConcept />));
};

const hiddenTickbox = () => container.querySelector("input#hidden");

// The last Key and Value fields in the free-form list: the row added most recently.
const lastFieldLabelled = (label) => {
  const labels = [...container.querySelectorAll("label")].filter(
    (l) => l.textContent === label,
  );
  return labels[labels.length - 1]
    .closest(".MuiFormControl-root")
    .querySelector("input");
};

const click = async (element) => {
  await act(async () => element.click());
};

const type = async (input, value) => {
  const setValue = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  await act(async () => {
    setValue.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
};

const save = async () => {
  const saveButton = [...container.querySelectorAll("button")].find(
    (b) => b.textContent === "SAVE",
  );
  await click(saveButton);
  const calls = ConceptService.saveConcept.mock.calls;
  return calls[calls.length - 1][0];
};

beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Hidden on the concept screen", () => {
  it("opens ticked when the marker arrived as the string true", async () => {
    await openConcept([{ key: "hidden", value: "true" }]);
    expect(hiddenTickbox().checked).toBe(true);
  });

  it("opens unticked when the concept has no marker", async () => {
    await openConcept([]);
    expect(hiddenTickbox().checked).toBe(false);
  });

  it("saves the marker when Hidden is ticked", async () => {
    await openConcept([{ key: "source", value: "model" }]);
    await click(hiddenTickbox());

    const saved = await save();

    expect(saved.keyValues).toEqual([
      { key: "source", value: "model" },
      { key: "hidden", value: true },
    ]);
  });

  it("removes the marker when Hidden is unticked and saved", async () => {
    await openConcept([
      { key: "hidden", value: true },
      { key: "source", value: "model" },
    ]);
    await click(hiddenTickbox());

    const saved = await save();

    expect(saved.keyValues).toEqual([{ key: "source", value: "model" }]);
  });

  it("keeps a hidden row typed into the key-value list editable", async () => {
    await openConcept([]);
    const addButton = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Add New Key-Value",
    );
    await click(addButton);

    await type(lastFieldLabelled("Key"), "hidden");

    expect(lastFieldLabelled("Key").value).toBe("hidden");
    expect(lastFieldLabelled("Key").disabled).toBe(false);
    expect(lastFieldLabelled("Value").disabled).toBe(false);

    await type(lastFieldLabelled("Value"), "true");
    expect(hiddenTickbox().checked).toBe(true);
  });
});
