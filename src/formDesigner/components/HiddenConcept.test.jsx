import { act } from "react";
import { createRoot } from "react-dom/client";
import { HiddenConceptCheckbox } from "./HiddenConcept";
import { ToolTip } from "../../common/components/ToolTip";

// The real ToolTip imports react-markdown, an ES module Jest here cannot load, and fetches its
// text on mount. Stubbed so the test can still check which tooltip key a control asks for.
jest.mock("../../common/components/ToolTip", () => ({
  ToolTip: jest.fn(() => null),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const render = async (element) => {
  await act(async () => root.render(element));
};

beforeEach(() => {
  ToolTip.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("HiddenConceptCheckbox", () => {
  it("is labelled Hidden and explains what hiding does", async () => {
    await render(
      <HiddenConceptCheckbox checked={false} onChange={jest.fn()} />,
    );
    expect(container.textContent).toContain("Hidden");
    expect(container.textContent).toContain(
      "Answers are saved and reach reporting, but are never shown in the app.",
    );
  });

  it("asks for the tooltip that explains hiding", async () => {
    await render(
      <HiddenConceptCheckbox checked={false} onChange={jest.fn()} />,
    );
    expect(ToolTip).toHaveBeenCalledWith(
      expect.objectContaining({ toolTipKey: "APP_DESIGNER_CONCEPT_HIDDEN" }),
      expect.anything(),
    );
  });

  it("shows the stored state", async () => {
    await render(<HiddenConceptCheckbox checked={true} onChange={jest.fn()} />);
    expect(container.querySelector("input#hidden").checked).toBe(true);
  });

  it("reports ticking and unticking", async () => {
    const onChange = jest.fn();
    await render(<HiddenConceptCheckbox checked={false} onChange={onChange} />);
    await act(async () => container.querySelector("input#hidden").click());
    expect(onChange).toHaveBeenLastCalledWith(true);

    await render(<HiddenConceptCheckbox checked={true} onChange={onChange} />);
    await act(async () => container.querySelector("input#hidden").click());
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});
