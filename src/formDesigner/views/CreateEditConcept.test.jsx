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
    get: jest.fn((url) =>
      Promise.resolve({
        data: url === "/concept/dataTypes" ? ["NA", "Text"] : [],
      }),
    ),
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

const savedConcept = (keyValues, dataType = "Text") => ({
  uuid: "concept-uuid",
  name: "AI verdict",
  dataType,
  active: true,
  keyValues,
  answers: [],
  media: [],
  organisationId: 1,
});

const openConcept = async (keyValues, dataType) => {
  ConceptService.getConcept.mockResolvedValue(
    savedConcept(keyValues, dataType),
  );
  ConceptService.saveConcept.mockImplementation(async (concept) => ({
    concept,
  }));
  await act(async () => root.render(<CreateEditConcept />));
};

const openNewConcept = async () => {
  await act(async () => root.render(<CreateEditConcept isCreatePage={true} />));
};

const hiddenSwitch = () => container.querySelector("input#hidden");

// Every Key or Value field in the free-form list, in row order.
const fieldsLabelled = (label) =>
  [...container.querySelectorAll("label")]
    .filter((l) => l.textContent === label)
    .map((l) => l.closest(".MuiFormControl-root").querySelector("input"));

// The row added most recently.
const lastFieldLabelled = (label) => fieldsLabelled(label).at(-1);

const deleteButtons = () => [
  ...container.querySelectorAll('button[aria-label="delete"]'),
];

const addKeyValueButton = () =>
  [...container.querySelectorAll("button")].find(
    (b) => b.textContent === "Add New Key-Value",
  );

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

const pressSave = async () => {
  const saveButton = [...container.querySelectorAll("button")].find(
    (b) => b.textContent === "SAVE",
  );
  await click(saveButton);
};

const save = async () => {
  await pressSave();
  const calls = ConceptService.saveConcept.mock.calls;
  return calls[calls.length - 1][0];
};

// The datatype picker is an Autocomplete: a mouse-down on its input opens the list.
const chooseDataType = async (dataType) => {
  await act(async () =>
    container
      .querySelector("input#dataType")
      .dispatchEvent(new window.MouseEvent("mousedown", { bubbles: true })),
  );
  const option = [...document.querySelectorAll('[role="option"]')].find(
    (o) => o.textContent === dataType,
  );
  await click(option);
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
  it("opens switched on when the marker arrived as the string true", async () => {
    await openConcept([{ key: "hidden", value: "true" }]);
    expect(hiddenSwitch().checked).toBe(true);
  });

  it("opens switched off when the concept has no marker", async () => {
    await openConcept([]);
    expect(hiddenSwitch().checked).toBe(false);
  });

  it("saves the marker when Hidden is switched on", async () => {
    await openConcept([{ key: "source", value: "model" }]);
    await click(hiddenSwitch());

    const saved = await save();

    expect(saved.keyValues).toEqual([
      { key: "source", value: "model" },
      { key: "hidden", value: true },
    ]);
  });

  it("removes the marker when Hidden is switched off and saved", async () => {
    await openConcept([
      { key: "hidden", value: true },
      { key: "source", value: "model" },
    ]);
    await click(hiddenSwitch());

    const saved = await save();

    expect(saved.keyValues).toEqual([{ key: "source", value: "model" }]);
  });

  it("locks the hidden row in the key-value list, and only that row", async () => {
    await openConcept([
      { key: "source", value: "model" },
      { key: "hidden", value: true },
    ]);
    const [sourceKey, hiddenKey] = fieldsLabelled("Key");
    const [sourceValue, hiddenValue] = fieldsLabelled("Value");
    const [sourceDelete, hiddenDelete] = deleteButtons();

    expect([hiddenKey.value, hiddenValue.value]).toEqual(["hidden", "true"]);
    expect([
      hiddenKey.disabled,
      hiddenValue.disabled,
      hiddenDelete.disabled,
    ]).toEqual([true, true, true]);
    expect([
      sourceKey.disabled,
      sourceValue.disabled,
      sourceDelete.disabled,
    ]).toEqual([false, false, false]);
  });

  it("adds a locked row when Hidden is switched on", async () => {
    await openConcept([]);
    await click(hiddenSwitch());

    expect(lastFieldLabelled("Key").value).toBe("hidden");
    expect(lastFieldLabelled("Key").disabled).toBe(true);
    expect(lastFieldLabelled("Value").disabled).toBe(true);
  });

  it("locks a hidden key typed by hand, and the switch is the way to clear it", async () => {
    await openConcept([]);
    await click(addKeyValueButton());
    await type(lastFieldLabelled("Key"), "hidden");

    expect(lastFieldLabelled("Key").disabled).toBe(true);
    expect(lastFieldLabelled("Value").disabled).toBe(true);
    expect(hiddenSwitch().checked).toBe(false);

    await pressSave();
    expect(ConceptService.saveConcept).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Key-Value can't be blank");

    await click(hiddenSwitch());
    await click(hiddenSwitch());

    expect((await save()).keyValues).toEqual([]);
  });

  it("leaves a hidden key typed on an NA concept editable, since it has no switch to clear it", async () => {
    await openConcept([], "NA");
    await click(addKeyValueButton());
    await type(lastFieldLabelled("Key"), "hidden");

    expect(lastFieldLabelled("Key").disabled).toBe(false);
    expect(lastFieldLabelled("Value").disabled).toBe(false);

    await click(deleteButtons().at(-1));

    expect((await save()).keyValues).toEqual([]);
  });

  it("replaces a stored marker the app does not read as hidden when switched on", async () => {
    await openConcept([{ key: "hidden", value: "yes" }]);
    expect(hiddenSwitch().checked).toBe(false);
    expect(lastFieldLabelled("Value").disabled).toBe(true);

    await click(hiddenSwitch());

    expect((await save()).keyValues).toEqual([{ key: "hidden", value: true }]);
  });

  it("offers no Hidden switch on an NA concept", async () => {
    await openConcept([], "NA");
    expect(hiddenSwitch()).toBeNull();
  });

  it("offers Hidden on a new concept only once a datatype other than NA is chosen", async () => {
    await openNewConcept();
    expect(hiddenSwitch()).toBeNull();

    await chooseDataType("Text");
    expect(hiddenSwitch()).not.toBeNull();

    await chooseDataType("NA");
    expect(hiddenSwitch()).toBeNull();
  });
});
