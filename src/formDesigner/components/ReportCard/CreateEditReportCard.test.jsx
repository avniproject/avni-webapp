import { act } from "react";
import { createRoot } from "react-dom/client";
import fs from "fs";
import path from "path";
import { omit } from "lodash";
import { CreateEditReportCard } from "./CreateEditReportCard";
import WebReportCard from "../../../common/model/WebReportCard";
import DashboardService from "../../../common/service/DashboardService";
import { httpClient } from "../../../common/utils/httpClient";
import { networkErrorNotifier } from "../../../common/utils/networkErrorNotifier";

// The real ToolTip imports react-markdown and fetches its text on mount. Stubbed with a marker
// carrying the key it was asked for, so a test can check which help text a field's help button opens.
jest.mock("../../../common/components/ToolTip", () => ({
  ToolTip: ({ toolTipKey }) =>
    require("react").createElement("span", { "data-tooltip-key": toolTipKey }),
}));
// The real DocumentationContainer renders PlatformDocumentation, which calls fetch(...).then on
// mount, and setupTests.cjs makes fetch a bare jest.fn() that returns undefined.
jest.mock("../../../common/components/DocumentationContainer", () => ({
  DocumentationContainer: ({ children }) => children,
}));
jest.mock("react-admin", () => ({ Title: () => null }));

let mockParams = {};
// Navigate leaves a marker carrying its target, so a test can tell whether the editor moved on.
jest.mock("react-router-dom", () => ({
  useParams: () => mockParams,
  Navigate: ({ to }) =>
    require("react").createElement("span", { "data-navigate-to": to }),
}));

// GET responses by URL. The Do visit pickers map over what they get, so any other URL answers [].
// A URL in mockFailures rejects with that error instead.
let mockResponses = {};
let mockFailures = {};
jest.mock("../../../common/utils/httpClient", () => ({
  httpClient: {
    getData: jest.fn((url) =>
      mockFailures[url]
        ? Promise.reject(mockFailures[url])
        : Promise.resolve(mockResponses[url] ?? []),
    ),
    getAllData: () => Promise.resolve([]),
  },
}));
jest.mock("../../../common/utils/networkErrorNotifier", () => ({
  networkErrorNotifier: { notify: jest.fn() },
}));
jest.mock("../../../common/service/DashboardService", () => ({
  __esModule: true,
  default: {
    getStandardReportCardTypes: () => Promise.resolve([]),
    getReportCard: jest.fn(),
    saveReportCard: jest.fn(),
  },
}));
jest.mock("../../../common/service/CustomCardConfigService", () => ({
  __esModule: true,
  default: {
    getByUuid: () =>
      Promise.resolve({
        dataRule: null,
        htmlFileS3Key: "card.html",
        translations: {},
      }),
  },
}));
// The save uploads the icon to MediaFolder.ICONS before it saves the card. With no new file
// the real uploadImage answers with the key the card already has.
jest.mock("../../../common/utils/S3Client", () => ({
  MediaFolder: { ICONS: "icons" },
  uploadImage: (existing) => Promise.resolve([existing]),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// As GET /web/dashboard answers it: ordered by name.
const dashboards = Array.from({ length: 25 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return { uuid: `dash-${number}`, name: `Dashboard ${number}` };
});

// As GET /web/reportCard/5 answers it.
const resource = (overrides) => ({
  id: 5,
  name: "Monthly overview",
  description: null,
  color: "#1b6ec2",
  query: "({params}) => []",
  nested: false,
  count: 1,
  standardReportCardInputSubjectTypes: [],
  standardReportCardInputPrograms: [],
  standardReportCardInputEncounterTypes: [],
  standardReportCardInputRecentDuration: null,
  ...overrides,
});

const customDataCard = (overrides) =>
  resource({ action: "ViewSubjectProfile", ...overrides });

const customDesignCard = (overrides) =>
  resource({
    customCardConfigUUID: "config-1",
    customCardConfigName: "Monthly overview",
    query: null,
    action: null,
    ...overrides,
  });

const openDashboardCard = (dashboardUUID) =>
  customDataCard({
    action: "OpenDashboard",
    actionDetailDashboardUUID: dashboardUUID,
  });

const openDashboardDesignCard = (dashboardUUID) =>
  customDesignCard({
    action: "OpenDashboard",
    actionDetailDashboardUUID: dashboardUUID,
  });

const nestedCard = (overrides) =>
  resource({ nested: true, action: "ViewSubjectProfile", ...overrides });

const DO_VISIT_DETAILS = {
  action: "DoVisit",
  actionDetailSubjectTypeUUID: "st-1",
  actionDetailProgramUUID: "pr-1",
  actionDetailEncounterTypeUUID: "et-1",
  actionDetailVisitType: "Scheduled",
  onActionCompletion: "goToSubjectProfile",
};

const MARK_ATTENDANCE_DETAILS = {
  action: "MarkAttendance",
  actionDetailSubjectTypeUUID: "group-1",
  actionDetailAttendanceTypeUUID: "at-1",
  onActionCompletion: "goToSourceScreen",
};

// What a Custom Design Card's save sends as its custom card config, from getByUuid above.
const SAVED_CUSTOM_CARD_CONFIG = {
  uuid: "config-1",
  name: "Monthly overview",
  dataRule: null,
  htmlFileS3Key: "card.html",
  translations: {},
};

const CUSTOM_DATA_ACTIONS = [
  "View subject profile",
  "Do visit",
  "Mark attendance",
  "Approve or reject",
  "Open dashboard",
];

const DASHBOARD_REQUIRED = "Dashboard is required for Open dashboard action";

// The save reads status and data.id; a bare jest.fn() leaves "Cannot read properties of undefined" on screen.
const savedResponse = { status: 200, data: { id: 5 } };

// As axios rejects when the server answers with an error status.
const SERVER_ERROR = {
  isAxiosError: true,
  response: { status: 500, data: "boom" },
  message: "Request failed with status code 500",
};

// As axios rejects when the server cannot be reached.
const NETWORK_ERROR = {
  isAxiosError: true,
  code: "ERR_NETWORK",
  message: "Network Error",
};

// The help button fetches this file and shows "No key found" for a key it lacks.
const toolTips = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../../../public/documentation/toolTip.json"),
    "utf8",
  ),
);

let container;
let root;
// The body of the last save, taken when saveReportCard was called.
let sent;

const openEditor = async (cardResource) => {
  if (cardResource) {
    mockParams = { id: "5" };
    DashboardService.getReportCard.mockResolvedValue(
      WebReportCard.fromResource(cardResource),
    );
  }
  await act(async () => root.render(<CreateEditReportCard />));
};

const pickCardType = async (label) => {
  const radio = [...container.querySelectorAll("label")]
    .find((element) => element.textContent === label)
    ?.querySelector('input[type="radio"]');
  if (!radio) throw new Error(`No card type ${label}`);
  await act(async () => radio.click());
};

const fieldLabel = (label) =>
  [...container.querySelectorAll("label[for]")].find((element) =>
    element.textContent.startsWith(label),
  );

const fieldInput = (label) => {
  const labelElement = fieldLabel(label);
  if (!labelElement) throw new Error(`No field labelled ${label}`);
  return document.getElementById(labelElement.htmlFor);
};

const fieldValue = (label) => fieldInput(label).value;

// What a field shows, or undefined when the editor has no such field.
const shownValue = (label) =>
  fieldLabel(label) ? fieldValue(label) : undefined;

// The native setter bypasses React's own value tracking, so React sees the input event as a change.
const typeInto = (field, value) =>
  act(async () => {
    Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(field),
      "value",
    ).set.call(field, value);
    field.dispatchEvent(new window.Event("input", { bubbles: true }));
  });

const pressKey = (input, key) =>
  input.dispatchEvent(
    new window.KeyboardEvent("keydown", { key, bubbles: true }),
  );

const openList = (input) =>
  act(async () => {
    input.focus();
    pressKey(input, "ArrowDown");
  });

const listedOptions = () => [...document.querySelectorAll('[role="option"]')];

const optionsOf = async (label) => {
  const input = fieldInput(label);
  await openList(input);
  const texts = listedOptions().map((option) => option.textContent);
  await act(async () => pressKey(input, "Escape"));
  return texts;
};

const choose = async (label, text) => {
  await openList(fieldInput(label));
  const option = listedOptions().find(
    (element) => element.textContent === text,
  );
  if (!option) throw new Error(`No option ${text} in ${label}`);
  await act(async () => option.click());
};

// The button reads SAVE.
const saveButton = () =>
  [...container.querySelectorAll("button")].find(
    (button) => button.textContent.trim().toLowerCase() === "save",
  );

const save = () => act(async () => saveButton().click());

const saved = () => DashboardService.saveReportCard.mock.calls[0][0];

// Where the editor sent the user, if anywhere.
const navigatedTo = () =>
  container
    .querySelector("[data-navigate-to]")
    ?.getAttribute("data-navigate-to");

// ToolTipContainer draws one flex row: the field, then its help button.
const helpKeyBeside = (label) => {
  const input = fieldInput(label);
  return [...container.querySelectorAll("[data-tooltip-key]")]
    .find((helpButton) =>
      helpButton.parentElement.parentElement.contains(input),
    )
    ?.getAttribute("data-tooltip-key");
};

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  mockResponses = { "/web/dashboard": dashboards };
  mockFailures = {};
  sent = undefined;
  DashboardService.saveReportCard.mockImplementation((card) => {
    sent = card.toResource();
    return Promise.resolve(savedResponse);
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Open dashboard in the card editor", () => {
  it("offers View subject profile, Do visit, Mark attendance, Approve or reject and Open dashboard on a Custom Data Card", async () => {
    await openEditor();
    await pickCardType("Custom Data Card");

    expect(await optionsOf("Action")).toEqual(CUSTOM_DATA_ACTIONS);
  });

  it("offers only No action and Open dashboard on a Custom Design Card, starting with no action", async () => {
    await openEditor();
    await pickCardType("Custom Design Card");

    expect(fieldValue("Action")).toBe("No action");
    expect(await optionsOf("Action")).toEqual(["No action", "Open dashboard"]);
  });

  it("keeps the subject actions, without Open dashboard, on a nested card", async () => {
    await openEditor();
    await pickCardType("Nested Report Card");

    expect(await optionsOf("Action")).toEqual([
      "View subject profile",
      "Do visit",
      "Mark attendance",
      "Approve or reject",
    ]);
  });

  it("lists every dashboard by name once Open dashboard is chosen", async () => {
    await openEditor();
    await pickCardType("Custom Data Card");
    await choose("Action", "Open dashboard");

    expect(httpClient.getData).toHaveBeenCalledWith("/web/dashboard");
    expect(await optionsOf("Dashboard")).toEqual(
      dashboards.map((dashboard) => dashboard.name),
    );
  });

  it("refuses to save Open dashboard with no dashboard picked", async () => {
    await openEditor(customDataCard());
    await choose("Action", "Open dashboard");
    await save();

    expect(container.textContent).toContain(DASHBOARD_REQUIRED);
    expect(DashboardService.saveReportCard).not.toHaveBeenCalled();
  });

  it("shows Open dashboard and the chosen dashboard when a saved card is reopened", async () => {
    await openEditor(openDashboardCard("dash-02"));

    expect(fieldValue("Action")).toBe("Open dashboard");
    expect(fieldValue("Dashboard")).toBe("Dashboard 02");
  });

  it("saves the picked dashboard", async () => {
    await openEditor(customDataCard());
    await choose("Action", "Open dashboard");
    await choose("Dashboard", "Dashboard 02");
    await save();

    expect(saved().toResource()).toMatchObject({
      action: "OpenDashboard",
      actionDetailDashboardUUID: "dash-02",
    });
    expect(navigatedTo()).toBe("/appDesigner/reportCard/5/show");
  });

  it("clears the dashboard when the action changes away from Open dashboard and the card is saved", async () => {
    await openEditor(openDashboardCard("dash-02"));
    await choose("Action", "View subject profile");
    await save();

    expect(saved().toResource()).toMatchObject({
      action: "ViewSubjectProfile",
      actionDetailDashboardUUID: null,
    });
  });

  it.each([
    ["ViewSubjectProfile", null],
    ["OpenDashboard", "dash-02"],
  ])(
    "resets the action to none when a %s card becomes a Custom Design Card",
    async (action, actionDetailDashboardUUID) => {
      await openEditor(customDataCard({ action, actionDetailDashboardUUID }));
      await pickCardType("Custom Design Card");

      expect(fieldValue("Action")).toBe("No action");
      expect(() => fieldValue("Dashboard")).toThrow(
        "No field labelled Dashboard",
      );
    },
  );

  it("keeps Open dashboard and its dashboard when a Custom Design Card becomes a Custom Data Card", async () => {
    await openEditor(
      customDesignCard({
        action: "OpenDashboard",
        actionDetailDashboardUUID: "dash-02",
      }),
    );
    expect(fieldValue("Action")).toBe("Open dashboard");
    expect(fieldValue("Dashboard")).toBe("Dashboard 02");
    expect(await optionsOf("Action")).toEqual(["No action", "Open dashboard"]);

    await pickCardType("Custom Data Card");

    expect(fieldValue("Action")).toBe("Open dashboard");
    expect(fieldValue("Dashboard")).toBe("Dashboard 02");
    expect(await optionsOf("Action")).toEqual(CUSTOM_DATA_ACTIONS);
  });

  it.each([
    ["Do visit", DO_VISIT_DETAILS],
    ["Mark attendance", MARK_ATTENDANCE_DETAILS],
  ])(
    "leaves a %s card's details untouched when the editor opens and saves",
    async (_actionName, details) => {
      await openEditor(customDataCard(details));
      await save();

      expect(saved().toResource()).toMatchObject({
        ...details,
        actionDetailDashboardUUID: null,
      });
    },
  );

  it("shows an empty Dashboard picker when the saved target is not in the list", async () => {
    await openEditor(openDashboardCard("dash-gone"));

    expect(await optionsOf("Dashboard")).toEqual(
      dashboards.map((dashboard) => dashboard.name),
    );
    expect(fieldValue("Dashboard")).toBe("");
  });

  it("shows the server's message when a card whose target was deleted is saved again", async () => {
    // The 400 body avni-server sends, stack trace included.
    DashboardService.saveReportCard.mockRejectedValue({
      response: {
        data: "org.avni.server.util.BadRequestError: Dashboard with uuid dash-gone doesn't exist\n\tat org.avni.server.service.CardService",
      },
    });
    await openEditor(openDashboardCard("dash-gone"));
    await save();

    expect(document.body.textContent).toContain(
      "Dashboard with uuid dash-gone doesn't exist",
    );
    expect(document.body.textContent).not.toContain("org.avni.server");
    expect(navigatedTo()).toBeUndefined();
    expect(saveButton()).toBeDefined();
  });

  // A Standard card needs a standard type and a Custom Design Card has no query, so most of
  // these cards cannot be saved; choosing Open dashboard again shows the dashboard is gone.
  it.each([
    [
      "Custom Data",
      "Nested Report Card",
      "View subject profile",
      openDashboardCard("dash-02"),
    ],
    [
      "Custom Data",
      "Standard Report Card",
      undefined,
      openDashboardCard("dash-02"),
    ],
    [
      "Custom Design",
      "Nested Report Card",
      "View subject profile",
      openDashboardDesignCard("dash-02"),
    ],
    [
      "Custom Design",
      "Standard Report Card",
      undefined,
      openDashboardDesignCard("dash-02"),
    ],
  ])(
    "drops the dashboard when an Open dashboard %s Card becomes a %s",
    async (_start, target, actionOnTarget, startCard) => {
      await openEditor(startCard);
      await pickCardType(target);

      expect(shownValue("Action")).toBe(actionOnTarget);
      expect(shownValue("Dashboard")).toBeUndefined();

      await pickCardType("Custom Data Card");

      expect(shownValue("Action")).toBe("View subject profile");
      expect(shownValue("Dashboard")).toBeUndefined();

      await choose("Action", "Open dashboard");

      expect(fieldValue("Dashboard")).toBe("");
    },
  );

  it("shows no dashboards and still refuses to save when there are none", async () => {
    mockResponses["/web/dashboard"] = [];
    await openEditor(customDataCard());
    await choose("Action", "Open dashboard");

    expect(await optionsOf("Dashboard")).toEqual([]);

    await save();

    expect(container.textContent).toContain(DASHBOARD_REQUIRED);
    expect(DashboardService.saveReportCard).not.toHaveBeenCalled();
  });

  it("saves Open dashboard and its dashboard on a Custom Design Card", async () => {
    await openEditor(customDesignCard());
    await choose("Action", "Open dashboard");
    await choose("Dashboard", "Dashboard 02");
    await save();

    expect(saved().toResource()).toMatchObject({
      action: "OpenDashboard",
      actionDetailDashboardUUID: "dash-02",
    });
    expect(saved().toResource().customCardConfig).toEqual(
      SAVED_CUSTOM_CARD_CONFIG,
    );
  });

  it("asks for help text that exists for the Dashboard picker", async () => {
    await openEditor();
    await pickCardType("Custom Data Card");
    await choose("Action", "Open dashboard");

    const helpKey = helpKeyBeside("Dashboard");

    expect(helpKey).toBe("APP_DESIGNER_CARD_ACTION_DASHBOARD");
    expect(typeof toolTips[helpKey]).toBe("string");
    expect(toolTips[helpKey].trim()).not.toBe("");
  });

  it("refuses to save Open dashboard with no dashboard picked on a Custom Design Card", async () => {
    await openEditor(customDesignCard());
    await choose("Action", "Open dashboard");
    await save();

    expect(container.textContent).toContain(DASHBOARD_REQUIRED);
    expect(DashboardService.saveReportCard).not.toHaveBeenCalled();
  });

  it("shows no Action list on a Standard card", async () => {
    await openEditor();
    await pickCardType("Standard Report Card");

    expect(() => fieldValue("Action")).toThrow("No field labelled Action");
  });

  // The expectation is built through fromResource, as the editor reads the card, so a default
  // fromResource fills in (a missing completion step) is not taken for a change.
  it.each([
    ["nested View subject profile", nestedCard(), null],
    ["nested Do visit", nestedCard(DO_VISIT_DETAILS), null],
    ["Custom Data View subject profile", customDataCard(), null],
    ["Custom Data Do visit", customDataCard(DO_VISIT_DETAILS), null],
    [
      "Custom Data Mark attendance",
      customDataCard(MARK_ATTENDANCE_DETAILS),
      null,
    ],
    ["Custom Data Open dashboard", openDashboardCard("dash-02"), null],
    ["Custom Design no action", customDesignCard(), SAVED_CUSTOM_CARD_CONFIG],
    [
      "Custom Design Open dashboard",
      openDashboardDesignCard("dash-02"),
      SAVED_CUSTOM_CARD_CONFIG,
    ],
  ])(
    "sends an unchanged %s card back exactly as it was read",
    async (_card, cardResource, customCardConfig) => {
      await openEditor(cardResource);
      await save();

      expect(omit(sent, "customCardConfig")).toEqual(
        omit(
          WebReportCard.fromResource(cardResource).toResource(),
          "customCardConfig",
        ),
      );
      expect(sent.customCardConfig).toEqual(customCardConfig);
    },
  );

  it.each([
    ["Custom Data", openDashboardCard("dash-02"), undefined],
    ["Custom Design", openDashboardDesignCard("dash-02"), "card.html"],
  ])(
    "keeps an Open dashboard card's dashboard when the name changes on a %s Card",
    async (_cardType, cardResource, htmlFileS3Key) => {
      await openEditor(cardResource);
      await typeInto(fieldInput("Name"), "Renamed");
      await save();

      expect(sent).toMatchObject({
        name: "Renamed",
        action: "OpenDashboard",
        actionDetailDashboardUUID: "dash-02",
      });
      expect(sent.customCardConfig?.htmlFileS3Key).toBe(htmlFileS3Key);
    },
  );

  it("clears the refusal once a dashboard is picked, then saves", async () => {
    await openEditor(customDataCard());
    await choose("Action", "Open dashboard");
    await save();

    expect(container.textContent).toContain(DASHBOARD_REQUIRED);

    await choose("Dashboard", "Dashboard 02");

    expect(container.textContent).not.toContain(DASHBOARD_REQUIRED);

    await save();

    expect(sent.actionDetailDashboardUUID).toBe("dash-02");
    expect(navigatedTo()).toBe("/appDesigner/reportCard/5/show");
  });

  it("forgets the dashboard when the action leaves Open dashboard and comes back", async () => {
    await openEditor(openDashboardCard("dash-02"));
    await choose("Action", "View subject profile");
    await choose("Action", "Open dashboard");

    expect(fieldValue("Dashboard")).toBe("");

    await save();

    expect(container.textContent).toContain(DASHBOARD_REQUIRED);
    expect(DashboardService.saveReportCard).not.toHaveBeenCalled();
  });

  it("saves Open dashboard and its dashboard after a Custom Design Card becomes a Custom Data Card", async () => {
    await openEditor(
      customDesignCard({
        action: "OpenDashboard",
        actionDetailDashboardUUID: "dash-02",
        query: "({params}) => []",
      }),
    );
    await pickCardType("Custom Data Card");
    await save();

    expect(sent).toMatchObject({
      action: "OpenDashboard",
      actionDetailDashboardUUID: "dash-02",
      customCardConfig: null,
    });
  });

  it("clears the dashboard when a Custom Design Card goes back to No action", async () => {
    await openEditor(openDashboardDesignCard("dash-02"));
    await choose("Action", "No action");

    expect(() => fieldValue("Dashboard")).toThrow(
      "No field labelled Dashboard",
    );

    await save();

    expect(sent).toMatchObject({
      action: null,
      actionDetailDashboardUUID: null,
    });
    expect(sent.customCardConfig).toEqual(SAVED_CUSTOM_CARD_CONFIG);
  });

  it.each([
    [
      "a new Custom Design Card on No action",
      async () => {
        await openEditor();
        await pickCardType("Custom Design Card");
      },
      "No action",
      undefined,
    ],
    [
      "a nested Do visit card",
      () => openEditor(nestedCard(DO_VISIT_DETAILS)),
      "Do visit",
      "",
    ],
    ["a Standard card", () => openEditor(), undefined, undefined],
  ])(
    "sets View subject profile when %s becomes a Custom Data Card",
    async (_start, openStart, actionBefore, subjectTypeBefore) => {
      await openStart();

      expect(shownValue("Action")).toBe(actionBefore);
      expect(shownValue("Subject Type")).toBe(subjectTypeBefore);

      await pickCardType("Custom Data Card");

      expect(shownValue("Action")).toBe("View subject profile");
      expect(shownValue("Dashboard")).toBeUndefined();
      expect(shownValue("Subject Type")).toBeUndefined();
    },
  );

  it("lists both dashboards when two share a name, and saves the one picked", async () => {
    mockResponses["/web/dashboard"] = [
      { uuid: "dash-a", name: "Home" },
      { uuid: "dash-b", name: "Home" },
    ];
    await openEditor(customDataCard());
    await choose("Action", "Open dashboard");

    expect(await optionsOf("Dashboard")).toEqual(["Home", "Home"]);

    await openList(fieldInput("Dashboard"));
    await act(async () => listedOptions()[1].click());
    await save();

    expect(sent.actionDetailDashboardUUID).toBe("dash-b");
  });

  // In the app an unhandled rejection reaches MainApp's handler, which replaces the whole page
  // unless it is a network failure. Jest fails a test that leaves one, so passing shows it is handled.
  it("keeps the editor and the saved dashboard when the dashboard list fails with a server error", async () => {
    mockFailures["/web/dashboard"] = SERVER_ERROR;
    await openEditor(openDashboardCard("dash-02"));

    expect(httpClient.getData).toHaveBeenCalledWith("/web/dashboard");
    expect(saveButton()).toBeDefined();
    expect(fieldValue("Dashboard")).toBe("");

    await save();

    expect(sent.actionDetailDashboardUUID).toBe("dash-02");
    expect(networkErrorNotifier.notify).not.toHaveBeenCalled();
  });

  it("shows the network message when the dashboard list cannot be reached", async () => {
    mockFailures["/web/dashboard"] = NETWORK_ERROR;
    await openEditor(openDashboardCard("dash-02"));

    expect(networkErrorNotifier.notify).toHaveBeenCalledTimes(1);
  });
});

describe("Approve or reject in the card editor", () => {
  const approveRejectCard = (status) =>
    customDataCard({ action: "ApproveReject", actionDetailApprovalStatus: status });

  it("shows the Approval Status picker with the three states, starting at Pending approval", async () => {
    await openEditor(customDataCard());
    await choose("Action", "Approve or reject");

    expect(fieldValue("Approval Status")).toBe("Pending approval");
    expect(await optionsOf("Approval Status")).toEqual(["Pending approval", "Approved", "Rejected"]);
  });

  it("saves Approve or reject with the picked state", async () => {
    await openEditor(customDataCard());
    await choose("Action", "Approve or reject");
    await choose("Approval Status", "Rejected");
    await save();

    expect(saved().toResource()).toMatchObject({
      action: "ApproveReject",
      actionDetailApprovalStatus: "Rejected",
      actionDetailDashboardUUID: null,
    });
    expect(navigatedTo()).toBe("/appDesigner/reportCard/5/show");
  });

  it("shows the saved state when a saved card is reopened", async () => {
    await openEditor(approveRejectCard("Approved"));

    expect(fieldValue("Action")).toBe("Approve or reject");
    expect(fieldValue("Approval Status")).toBe("Approved");
  });

  it("drops the state when the action changes away and the card is saved", async () => {
    await openEditor(approveRejectCard("Approved"));
    await choose("Action", "View subject profile");
    await save();

    expect(container.textContent).not.toContain("Approval Status");
    expect(saved().toResource()).toMatchObject({
      action: "ViewSubjectProfile",
      actionDetailApprovalStatus: null,
    });
  });

  it("does not offer Approve or reject on a Custom Design Card", async () => {
    await openEditor();
    await pickCardType("Custom Design Card");

    expect(await optionsOf("Action")).not.toContain("Approve or reject");
  });

  it("asks for help text that exists for the Approval Status picker", async () => {
    await openEditor(customDataCard());
    await choose("Action", "Approve or reject");

    const helpKey = helpKeyBeside("Approval Status");

    expect(helpKey).toBe("APP_DESIGNER_CARD_ACTION_APPROVAL_STATUS");
    expect(typeof toolTips[helpKey]).toBe("string");
    expect(toolTips[helpKey].trim()).not.toBe("");
  });
});
