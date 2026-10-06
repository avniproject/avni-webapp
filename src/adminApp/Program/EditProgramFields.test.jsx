import { act } from "react";
import { createRoot } from "react-dom/client";
import EditProgramFields from "./EditProgramFields";

// The real ToolTip imports react-markdown, an ES module Jest here cannot load.
jest.mock("../../common/components/ToolTip", () => ({ ToolTip: () => null }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const savedProgram = (manualEligibilityCheckRequired) => ({
  uuid: "program-uuid",
  name: "Pregnancy",
  colour: "#ff0000",
  programSubjectLabel: "",
  enrolmentSummaryRule: "",
  allowMultipleEnrolments: false,
  manualEligibilityCheckRequired,
  showGrowthChart: false,
  loaded: true,
});

const openProgram = async (manualEligibilityCheckRequired) => {
  const dispatch = jest.fn();
  await act(async () =>
    root.render(
      <EditProgramFields
        program={savedProgram(manualEligibilityCheckRequired)}
        errors={new Map()}
        subjectTypes={[]}
        formList={[]}
        dispatch={dispatch}
        onSubjectTypeChange={jest.fn()}
        subjectType={{}}
      />,
    ),
  );
  return dispatch;
};

const manualEligibilitySwitch = () =>
  container.querySelector('input[name="Manual eligibility check required"]');

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Manual eligibility check required switch", () => {
  it("shows on when the program has it saved on", async () => {
    await openProgram(true);
    expect(manualEligibilitySwitch().checked).toBe(true);
  });

  it("shows off when the program has it saved off", async () => {
    await openProgram(false);
    expect(manualEligibilitySwitch().checked).toBe(false);
  });

  it("can be switched off when it is saved on", async () => {
    const dispatch = await openProgram(true);
    await act(async () => manualEligibilitySwitch().click());
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "manualEligibilityCheckRequired",
      payload: false,
    });
  });

  it("can be switched on when it is saved off", async () => {
    const dispatch = await openProgram(false);
    await act(async () => manualEligibilitySwitch().click());
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "manualEligibilityCheckRequired",
      payload: true,
    });
  });
});
