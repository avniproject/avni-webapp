import { act } from "react";
import { createRoot } from "react-dom/client";
import fs from "fs";
import path from "path";
import { OrgSettings } from "./OrgSettings";
import { httpClient } from "common/utils/httpClient";

// Keep the real tooltip interaction while replacing its ESM Markdown renderer for Jest.
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }) =>
    require("react").createElement("div", null, children),
}));
jest.mock("rehype-raw", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("rehype-sanitize", () => ({ __esModule: true, default: jest.fn() }));
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

const toolTips = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../../public/documentation/toolTip.json"),
    "utf8",
  ),
);
const originalFetch = global.fetch;

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

const disableFastSyncSwitch = () =>
  container.querySelector('input[name="Turn off fast sync"]');

const switchSettingsRow = (helpButton, settingSwitch) => {
  let row = helpButton.parentElement;
  while (row && !row.contains(settingSwitch)) {
    row = row.parentElement;
  }
  return row;
};

const click = async (element) => {
  await act(async () => element.click());
};

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => toolTips,
  });
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

afterAll(() => {
  if (originalFetch) {
    global.fetch = originalFetch;
  } else {
    delete global.fetch;
  }
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
    const row = switchSettingsRow(helpButton, clinicSharingSwitch());
    expect(row.style.display).toBe("flex");
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
  it("opens and displays its help text", async () => {
    await openSettings({});
    const helpButton = container.querySelector(
      '[data-tooltip-key="ADMIN_ENABLE_CLINIC_SHARING"]',
    );
    const row = switchSettingsRow(helpButton, clinicSharingSwitch());
    expect(row.style.display).toBe("flex");
    await click(helpButton);
    expect(container.textContent).toContain(
      "Lets staff in a mobile clinic share patient records",
    );
  });
});

describe("Turn off fast sync switch", () => {
  it("is on the organisation settings page and defaults off", async () => {
    await openSettings({});
    expect(disableFastSyncSwitch()).not.toBeNull();
    expect(disableFastSyncSwitch().checked).toBe(false);
    expect(container.textContent).toContain("Turn off fast sync");
  });

  it("reflects the saved setting", async () => {
    await openSettings({ disableFastSync: true });
    expect(disableFastSyncSwitch().checked).toBe(true);
  });

  it("saves the setting when switched on", async () => {
    httpClient.put.mockResolvedValue(savedAs({ disableFastSync: true }));
    await openSettings({});
    await click(disableFastSyncSwitch());
    expect(httpClient.put).toHaveBeenCalledWith("/organisationConfig", {
      settings: { disableFastSync: true },
    });
    expect(disableFastSyncSwitch().checked).toBe(true);
  });

  it("saves the setting when switched off", async () => {
    httpClient.put.mockResolvedValue(savedAs({ disableFastSync: false }));
    await openSettings({ disableFastSync: true });
    await click(disableFastSyncSwitch());
    expect(httpClient.put).toHaveBeenCalledWith("/organisationConfig", {
      settings: { disableFastSync: false },
    });
    expect(disableFastSyncSwitch().checked).toBe(false);
  });

  it("cannot be changed by a user without permission to edit organisation settings", async () => {
    await openSettings({}, { hasEditPrivilege: false });
    expect(disableFastSyncSwitch().disabled).toBe(true);
    await click(disableFastSyncSwitch());
    expect(httpClient.put).not.toHaveBeenCalled();
  });
});

describe("Turn off fast sync help text", () => {
  const toolTips = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/documentation/toolTip.json"),
      "utf8",
    ),
  );

  it("explains the effects of turning off fast sync", async () => {
    await openSettings({});
    const helpButton = container.querySelector(
      '[data-tooltip-key="ADMIN_DISABLE_FAST_SYNC"]',
    );
    const row = switchSettingsRow(helpButton, disableFastSyncSwitch());
    expect(row.style.display).toBe("flex");
    expect(helpButton.tagName).toBe("BUTTON");
    expect(helpButton.getAttribute("aria-label")).toBe("Show help");
    expect(helpButton.getAttribute("aria-expanded")).toBe("false");

    await click(helpButton);

    expect(helpButton.getAttribute("aria-expanded")).toBe("true");
    expect(helpButton.getAttribute("aria-describedby")).toBe(
      helpButton.getAttribute("aria-controls"),
    );
    expect(container.querySelector('[role="tooltip"]').textContent).toContain(
      "Field users will no longer see Setup fast sync. New phones will do a full first sync. Existing fast sync files are kept, and server-built snapshots are not affected.",
    );
  });
});
