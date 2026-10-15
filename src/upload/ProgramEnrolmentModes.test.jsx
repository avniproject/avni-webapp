import { act } from "react";
import { createRoot } from "react-dom/client";
import ProgramEnrolmentModes, {
  PROGRAM_ENROLMENT_MODES,
} from "./ProgramEnrolmentModes";
import en from "../../translations/en.json";

// Translations come from the server and may not be uploaded yet, so i18next falls back to the default text.
const mockT = jest.fn((key, defaultValue) => defaultValue ?? key);
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockT }),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const render = async (mode, setMode = jest.fn()) => {
  await act(async () =>
    root.render(<ProgramEnrolmentModes mode={mode} setMode={setMode} />),
  );
  return setMode;
};

const radios = () => [...container.querySelectorAll("input[type=radio]")];

const labelOf = (value) =>
  radios()
    .find((radio) => radio.value === value)
    .closest("label").textContent;

it("offers the three program enrolment upload modes the server accepts", async () => {
  await render(PROGRAM_ENROLMENT_MODES.UPLOAD);

  expect(radios().map((radio) => radio.value)).toEqual([
    "upload_enrolments",
    "upload_exited_enrolments",
    "exit_enrolments",
  ]);
});

it("labels each mode through a translation key, in English when no translation is loaded", async () => {
  await render(PROGRAM_ENROLMENT_MODES.UPLOAD);

  expect(labelOf("upload_enrolments")).toBe("Upload enrolments");
  expect(labelOf("upload_exited_enrolments")).toBe(
    "Upload historical exited enrolments",
  );
  expect(labelOf("exit_enrolments")).toBe("Exit enrolments");
  expect(container.querySelector("legend").textContent).toBe(
    "Select Enrolment Mode",
  );
});

it("gives every translation key the same English default as en.json", async () => {
  await render(PROGRAM_ENROLMENT_MODES.UPLOAD);

  const keys = new Set(mockT.mock.calls.map(([key]) => key));
  expect(keys.size).toBe(7);
  mockT.mock.calls.forEach(([key, defaultValue]) =>
    expect(defaultValue).toBe(en.translations[key]),
  );
});

it("picks exit enrolments", async () => {
  const setMode = await render(PROGRAM_ENROLMENT_MODES.UPLOAD);

  await act(async () =>
    radios()
      .find((radio) => radio.value === "exit_enrolments")
      .click(),
  );

  expect(setMode).toHaveBeenCalledWith("exit_enrolments");
});

it("has English text for every key the screen uses", () => {
  const translations = en.translations;

  expect(translations.selectEnrolmentMode).toBe("Select Enrolment Mode");
  expect(translations.uploadEnrolments).toBe("Upload enrolments");
  expect(translations.uploadHistoricalExitedEnrolments).toBe(
    "Upload historical exited enrolments",
  );
  expect(translations.exitEnrolments).toBe("Exit enrolments");
  expect(translations.uploadEnrolmentsTooltip).toBeTruthy();
  expect(translations.uploadHistoricalExitedEnrolmentsTooltip).toBeTruthy();
  expect(translations.exitEnrolmentsTooltip).toMatch(/already in Avni/);
});
