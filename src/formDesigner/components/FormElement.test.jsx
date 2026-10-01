import { act } from "react";
import { createRoot } from "react-dom/client";
import FormElement from "./FormElement";

// The real ToolTip imports react-markdown, an ES module Jest here cannot load.
jest.mock("../../common/components/ToolTip", () => ({ ToolTip: () => null }));
// The expanded panel is FormElementDetails, pinned by its own test. Only the header is drawn here.
jest.mock("./FormElementTabs", () => ({
  __esModule: true,
  default: () => null,
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const question = ({ hidden, mandatory }) => ({
  uuid: "form-element-uuid",
  name: "AI verdict",
  type: "SingleSelect",
  mandatory,
  expanded: false,
  keyValues: {},
  concept: {
    uuid: "concept-uuid",
    name: "AI verdict",
    dataType: "Text",
    keyValues: hidden ? [{ key: "hidden", value: true }] : [],
  },
});

const handleGroupElementChange = jest.fn();

const renderCollapsed = async (formElementData) => {
  await act(async () =>
    root.render(
      <FormElement
        formElementData={formElementData}
        groupIndex={0}
        index={0}
        disableFormElement={false}
        handleGroupElementChange={handleGroupElementChange}
        deleteGroup={jest.fn()}
      />,
    ),
  );
};

const headerMarker = () => container.querySelector("#panel00hidden");
const requiredAsterisk = () =>
  container.querySelector(".MuiFormLabel-asterisk");
const nameLabel = () => container.querySelector("label");

beforeEach(() => {
  jest.clearAllMocks();
  // The component logs every render; keep the test output readable.
  jest.spyOn(console, "log").mockImplementation(() => {});
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  console.log.mockRestore();
});

describe("A collapsed question in the form designer", () => {
  it("shows Hidden and no required asterisk when a mandatory question's concept is hidden", async () => {
    await renderCollapsed(question({ hidden: true, mandatory: true }));

    expect(nameLabel().textContent).toContain("AI verdict");
    expect(headerMarker()).not.toBeNull();
    expect(headerMarker().textContent).toBe("Hidden");
    expect(requiredAsterisk()).toBeNull();
  });

  it("leaves the stored mandatory setting alone when its concept is hidden", async () => {
    await renderCollapsed(question({ hidden: true, mandatory: true }));

    expect(handleGroupElementChange).not.toHaveBeenCalled();
  });

  it("shows Hidden on an optional question whose concept is hidden", async () => {
    await renderCollapsed(question({ hidden: true, mandatory: false }));

    expect(headerMarker()).not.toBeNull();
    expect(requiredAsterisk()).toBeNull();
  });

  it("still shows the required asterisk, and no Hidden marker, when its concept is not hidden", async () => {
    await renderCollapsed(question({ hidden: false, mandatory: true }));

    expect(headerMarker()).toBeNull();
    expect(requiredAsterisk()).not.toBeNull();
  });

  it("shows neither on an optional question whose concept is not hidden", async () => {
    await renderCollapsed(question({ hidden: false, mandatory: false }));

    expect(headerMarker()).toBeNull();
    expect(requiredAsterisk()).toBeNull();
  });
});
