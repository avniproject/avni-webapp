import { act } from "react";
import { createRoot } from "react-dom/client";
import FormElementDetails from "./FormElementDetails";
import { HIDDEN_MANDATORY_REASON } from "./HiddenConcept";

// The real ToolTip imports react-markdown, an ES module Jest here cannot load.
jest.mock("../../common/components/ToolTip", () => ({ ToolTip: () => null }));
jest.mock("../../common/components/PlatformDocumentation", () => ({
  PlatformDocumentation: () => null,
}));
jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({ app: { userInfo: { hasAllPrivileges: true } } }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock("common/utils/httpClient", () => ({
  httpClient: { get: jest.fn(() => Promise.resolve({ data: [] })) },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const question = ({ hidden, mandatory, newFlag = false }) => ({
  uuid: "form-element-uuid",
  name: "AI verdict",
  type: "SingleSelect",
  mandatory,
  newFlag,
  // Set on every saved question when a form loads (FormDetails.jsx), and on a new question
  // once its concept is chosen from the library.
  showConceptLibrary: "chooseFromLibrary",
  keyValues: {},
  errorMessage: {},
  concept: {
    uuid: "concept-uuid",
    name: "AI verdict",
    dataType: "Text",
    keyValues: hidden ? [{ key: "hidden", value: true }] : [],
  },
});

const handleGroupElementChange = jest.fn();

const renderQuestion = async (formElementData) => {
  await act(async () =>
    root.render(
      <FormElementDetails
        formElementData={formElementData}
        groupIndex={0}
        index={0}
        disableFormElement={false}
        handleGroupElementChange={handleGroupElementChange}
        handleGroupElementKeyValueChange={jest.fn()}
      />,
    ),
  );
};

const marker = () => container.querySelector("#hiddenQuestionMarker");
const mandatoryInput = () => container.querySelector("input#mandatoryDetails");

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

describe("A question in the form designer", () => {
  it("is marked Hidden, with Mandatory disabled and the reason shown, when its concept is hidden", async () => {
    await renderQuestion(question({ hidden: true, mandatory: false }));

    expect(marker()).not.toBeNull();
    expect(mandatoryInput().disabled).toBe(true);
    expect(container.textContent).toContain(HIDDEN_MANDATORY_REASON);
  });

  it("keeps a mandatory setting saved before its concept was hidden, and does not rewrite it", async () => {
    await renderQuestion(question({ hidden: true, mandatory: true }));

    expect(mandatoryInput().checked).toBe(true);
    expect(mandatoryInput().disabled).toBe(true);
    expect(handleGroupElementChange).not.toHaveBeenCalled();
  });

  it("is marked Hidden as soon as a hidden concept is picked for a new question", async () => {
    await renderQuestion(
      question({ hidden: true, mandatory: false, newFlag: true }),
    );

    expect(marker()).not.toBeNull();
  });

  it("is unchanged when its concept is not hidden", async () => {
    await renderQuestion(question({ hidden: false, mandatory: true }));

    expect(marker()).toBeNull();
    expect(mandatoryInput().disabled).toBe(false);
    expect(container.textContent).not.toContain(HIDDEN_MANDATORY_REASON);

    await act(async () => mandatoryInput().click());
    expect(handleGroupElementChange).toHaveBeenCalledWith(
      0,
      "mandatory",
      false,
      0,
    );
  });
});
