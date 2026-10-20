import { act } from "react";
import { createRoot } from "react-dom/client";
import { AbhaHipIdField, AbhaHipIdInput, abhaHipIdForSave } from "./AbhaHipId";

// The real inputs need a react-admin form and record around them. Stubbed with markers that
// carry what the screen asked for, so the test can check what is drawn and when.
jest.mock("react-admin", () => ({
  TextField: ({ source, label }) =>
    require("react").createElement("span", {
      "data-field": source,
      "data-label": label,
    }),
}));
jest.mock("./AvniTextInput", () => ({
  AvniTextInput: ({ source, label, toolTipKey, validate }) =>
    require("react").createElement("span", {
      "data-input": source,
      "data-label": label,
      "data-tooltip-key": toolTipKey,
      "data-validated": String(Boolean(validate)),
    }),
}));
jest.mock("../UserHelper", () => ({ doesNotHaveWhitespaces: () => undefined }));
let mockOrganisationConfig;
jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({ app: { organisationConfig: mockOrganisationConfig } }),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const draw = async (element) => act(async () => root.render(element));

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("ABHA health facility ID on the user form", () => {
  it("is drawn with its label and help tip when ABHA is on", async () => {
    mockOrganisationConfig = { enableAbha: true };
    await draw(<AbhaHipIdInput />);
    const input = container.querySelector('[data-input="settings.abhaHipId"]');
    expect(input.getAttribute("data-label")).toBe("ABHA health facility ID");
    expect(input.getAttribute("data-tooltip-key")).toBe(
      "ADMIN_USER_SETTINGS_ABHA_HIP_ID",
    );
    expect(input.getAttribute("data-validated")).toBe("true");
  });

  it("is not drawn when ABHA is off", async () => {
    mockOrganisationConfig = { enableAbha: false };
    await draw(<AbhaHipIdInput />);
    expect(container.innerHTML).toBe("");
  });

  it("is not drawn for an organisation that never set ABHA", async () => {
    mockOrganisationConfig = {};
    await draw(<AbhaHipIdInput />);
    expect(container.innerHTML).toBe("");
  });
});

describe("ABHA health facility ID on the user's details page", () => {
  it("is shown when ABHA is on", async () => {
    mockOrganisationConfig = { enableAbha: true };
    await draw(<AbhaHipIdField />);
    const field = container.querySelector('[data-field="settings.abhaHipId"]');
    expect(field.getAttribute("data-label")).toBe("ABHA health facility ID");
  });

  it("is not shown when ABHA is off", async () => {
    mockOrganisationConfig = { enableAbha: false };
    await draw(<AbhaHipIdField />);
    expect(container.innerHTML).toBe("");
  });
});

describe("abhaHipIdForSave", () => {
  it("sends an empty string when the field was cleared, as react-admin hands it over as null", () => {
    expect(
      abhaHipIdForSave({
        name: "A",
        settings: { abhaHipId: null, locale: "en" },
      }),
    ).toEqual({ name: "A", settings: { abhaHipId: "", locale: "en" } });
  });

  it("keeps an empty string as it is", () => {
    expect(abhaHipIdForSave({ settings: { abhaHipId: "" } })).toEqual({
      settings: { abhaHipId: "" },
    });
  });

  it("leaves a value alone", () => {
    const data = { settings: { abhaHipId: "HIP-1" } };
    expect(abhaHipIdForSave(data)).toEqual(data);
  });

  it("adds no key when the user never had one and never typed one", () => {
    expect(abhaHipIdForSave({ settings: { locale: "en" } })).toEqual({
      settings: { locale: "en" },
    });
    expect(abhaHipIdForSave({ name: "A" })).toEqual({ name: "A" });
  });
});
