import { act } from "react";
import { createRoot } from "react-dom/client";
import fs from "fs";
import path from "path";
import { OrgSettings } from "./OrgSettings";
import { httpClient } from "common/utils/httpClient";

// The real ToolTip imports react-markdown, an ES module Jest here cannot load, and fetches its
// text on mount. Stubbed with a marker carrying the key it was asked for, so the test can check
// which help text a switch's help button opens, and where that button sits.
jest.mock("../../common/components/ToolTip", () => ({
  ToolTip: ({ toolTipKey }) =>
    require("react").createElement("span", { "data-tooltip-key": toolTipKey }),
}));
jest.mock("common/utils/httpClient", () => ({
  httpClient: { fetchJson: jest.fn(), put: jest.fn() },
}));
// rootApp/ducks loads the Cognito and Keycloak sessions; the page only needs this one action.
jest.mock("../../rootApp/ducks", () => ({
  setOrganisationConfig: (organisationConfig) => ({
    type: "setOrganisationConfig",
    organisationConfig,
  }),
}));
jest.mock("react-redux", () => ({ useDispatch: () => jest.fn() }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

// As GET /web/organisationConfig answers it.
const openSettings = async (settings, { hasEditPrivilege = true } = {}) => {
  httpClient.fetchJson.mockResolvedValue({
    status: 200,
    json: {
      organisationConfig: settings,
      conceptList: [],
      isNewImplementation: false,
    },
  });
  await act(async () =>
    root.render(
      <OrgSettings
        hasEditPrivilege={hasEditPrivilege}
        dataDeletedIndicator={false}
      />,
    ),
  );
};

// As PUT /organisationConfig answers it: the organisation config, carrying every setting after the merge.
const savedAs = (settings) => ({
  status: 200,
  data: {
    uuid: "organisation-config-uuid",
    organisationId: 1,
    settings,
    worklistUpdationRule: null,
  },
});

const clinicSharingSwitch = () =>
  container.querySelector('input[name="Enable clinic sharing"]');

const click = async (element) => {
  await act(async () => element.click());
};

beforeEach(() => {
  httpClient.fetchJson.mockReset();
  httpClient.put.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Enable clinic sharing switch", () => {
  it("is on the organisation settings page", async () => {
    await openSettings({});
    expect(clinicSharingSwitch()).not.toBeNull();
    expect(container.textContent).toContain("Enable clinic sharing");
  });

  it("is off for an organisation that has never set it", async () => {
    await openSettings({ enableComments: true });
    expect(clinicSharingSwitch().checked).toBe(false);
  });

  it("is on for an organisation that has it on", async () => {
    await openSettings({ enableClinicSharing: true });
    expect(clinicSharingSwitch().checked).toBe(true);
  });

  it("has its own help button, which opens the clinic sharing help text", async () => {
    await openSettings({});
    const helpButton = container.querySelector(
      '[data-tooltip-key="ADMIN_ENABLE_CLINIC_SHARING"]',
    );
    // ToolTipContainer draws one flex row: the control, then the help button.
    const row = helpButton.parentElement.parentElement;
    expect(row.contains(clinicSharingSwitch())).toBe(true);
  });

  it("sends only enableClinicSharing: true when switched on", async () => {
    httpClient.put.mockResolvedValue(
      savedAs({ enableComments: true, enableClinicSharing: true }),
    );
    await openSettings({ enableComments: true });
    await click(clinicSharingSwitch());
    expect(httpClient.put).toHaveBeenCalledTimes(1);
    expect(httpClient.put).toHaveBeenCalledWith("/organisationConfig", {
      settings: { enableClinicSharing: true },
    });
  });

  it("shows on once the server has saved it", async () => {
    httpClient.put.mockResolvedValue(
      savedAs({ enableComments: true, enableClinicSharing: true }),
    );
    await openSettings({ enableComments: true });
    await click(clinicSharingSwitch());
    expect(clinicSharingSwitch().checked).toBe(true);
  });

  it("sends enableClinicSharing: false when switched off", async () => {
    httpClient.put.mockResolvedValue(savedAs({ enableClinicSharing: false }));
    await openSettings({ enableClinicSharing: true });
    await click(clinicSharingSwitch());
    expect(httpClient.put).toHaveBeenCalledWith("/organisationConfig", {
      settings: { enableClinicSharing: false },
    });
  });

  it("stays off until the server confirms the save", async () => {
    httpClient.put.mockReturnValue(new Promise(() => {}));
    await openSettings({});
    await click(clinicSharingSwitch());
    expect(clinicSharingSwitch().checked).toBe(false);
  });

  it("cannot be changed by a user without permission to edit organisation settings", async () => {
    await openSettings({}, { hasEditPrivilege: false });
    expect(clinicSharingSwitch().disabled).toBe(true);
    await click(clinicSharingSwitch());
    expect(httpClient.put).not.toHaveBeenCalled();
  });
});

describe("Enable clinic sharing help text", () => {
  // The help button fetches this file and shows "No key found" for a key it lacks.
  const toolTips = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/documentation/toolTip.json"),
      "utf8",
    ),
  );

  it("is there for the key the switch's help button asks for", async () => {
    await openSettings({});
    const helpButton = [
      ...container.querySelectorAll("[data-tooltip-key]"),
    ].find((button) =>
      button.parentElement.parentElement.contains(clinicSharingSwitch()),
    );
    const helpText = toolTips[helpButton.getAttribute("data-tooltip-key")];
    expect(typeof helpText).toBe("string");
    expect(helpText.trim()).not.toBe("");
  });
});

describe("Enable ABHA switch", () => {
  const abhaSwitch = () => container.querySelector('input[name="Enable ABHA"]');
  const toolTips = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/documentation/toolTip.json"),
      "utf8",
    ),
  );

  it("rendersEnableAbhaSwitch with its own help button", async () => {
    await openSettings({});
    expect(abhaSwitch()).not.toBeNull();
    expect(abhaSwitch().checked).toBe(false);
    const helpButton = container.querySelector(
      '[data-tooltip-key="ENABLE_ABHA"]',
    );
    expect(helpButton.parentElement.parentElement.contains(abhaSwitch())).toBe(
      true,
    );
    expect(toolTips.ENABLE_ABHA.trim()).not.toBe("");
  });

  it("is on for an organisation that has it on", async () => {
    await openSettings({ enableAbha: true });
    expect(abhaSwitch().checked).toBe(true);
  });

  it("sends only enableAbha: true when switched on", async () => {
    httpClient.put.mockResolvedValue(
      savedAs({ enableComments: true, enableAbha: true }),
    );
    await openSettings({ enableComments: true });
    await click(abhaSwitch());
    expect(httpClient.put).toHaveBeenCalledWith("/organisationConfig", {
      settings: { enableAbha: true },
    });
    expect(abhaSwitch().checked).toBe(true);
  });

  it("abhaSwitchDisabledWithoutEditPrivilege", async () => {
    await openSettings({}, { hasEditPrivilege: false });
    expect(abhaSwitch().disabled).toBe(true);
    await click(abhaSwitch());
    expect(httpClient.put).not.toHaveBeenCalled();
  });
});
