import { act } from "react";
import { createRoot } from "react-dom/client";
import {
  HIDDEN_MANDATORY_REASON,
  HiddenConceptCheckbox,
  HiddenQuestionMarker,
} from "./HiddenConcept";
import { MandatoryCheckbox } from "./MandatoryCheckbox";
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
      "Values recorded for this concept are saved and reach reporting, but are never shown in the app.",
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

describe("HiddenQuestionMarker", () => {
  it("says the question is hidden and that this is set on the concept", async () => {
    await render(<HiddenQuestionMarker />);
    expect(container.querySelector("#hiddenQuestionMarker").textContent).toBe(
      "Hidden",
    );
    expect(container.textContent).toContain(
      "Answers are saved but never shown in the app. Change this on the concept.",
    );
    expect(container.querySelector("input")).toBeNull();
  });
});

describe("MandatoryCheckbox", () => {
  const mandatoryInput = () =>
    container.querySelector("input#mandatoryDetails");

  it("stays editable on a question that is not hidden", async () => {
    const onChange = jest.fn();
    await render(
      <MandatoryCheckbox
        mandatory={false}
        disabled={false}
        conceptHidden={false}
        onChange={onChange}
      />,
    );
    expect(mandatoryInput().disabled).toBe(false);
    expect(container.textContent).not.toContain(HIDDEN_MANDATORY_REASON);
    await act(async () => mandatoryInput().click());
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("unticks a mandatory question that is not hidden", async () => {
    const onChange = jest.fn();
    await render(
      <MandatoryCheckbox
        mandatory={true}
        disabled={false}
        conceptHidden={false}
        onChange={onChange}
      />,
    );
    await act(async () => mandatoryInput().click());
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("is disabled with the reason shown on a hidden question", async () => {
    await render(
      <MandatoryCheckbox
        mandatory={false}
        disabled={false}
        conceptHidden={true}
        onChange={jest.fn()}
      />,
    );
    expect(mandatoryInput().disabled).toBe(true);
    const reason = [...container.querySelectorAll("p")].find(
      (p) => p.textContent === HIDDEN_MANDATORY_REASON,
    );
    // Drawn at full contrast, not greyed out with the disabled tickbox.
    expect(reason.classList.contains("Mui-disabled")).toBe(false);
  });

  it("keeps showing a mandatory setting saved before the concept was hidden, without changing it", async () => {
    const onChange = jest.fn();
    await render(
      <MandatoryCheckbox
        mandatory={true}
        disabled={false}
        conceptHidden={true}
        onChange={onChange}
      />,
    );
    expect(mandatoryInput().checked).toBe(true);
    expect(mandatoryInput().disabled).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("stays disabled for a user who cannot edit the form, as today", async () => {
    await render(
      <MandatoryCheckbox
        mandatory={false}
        disabled={true}
        conceptHidden={false}
        onChange={jest.fn()}
      />,
    );
    expect(mandatoryInput().disabled).toBe(true);
    expect(container.textContent).not.toContain(HIDDEN_MANDATORY_REASON);
  });
});
