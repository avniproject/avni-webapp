import { act } from "react";
import { createRoot } from "react-dom/client";
import ReportCardShow from "./ReportCardShow";
import { httpClient } from "../../../common/utils/httpClient";
import { networkErrorNotifier } from "../../../common/utils/networkErrorNotifier";

jest.mock("react-admin", () => ({ Title: () => null }));
jest.mock("react-router-dom", () => ({ useParams: () => ({ id: "5" }) }));
jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({ app: { userInfo: { privileges: [] } } }),
}));

let mockResponses = {};
let mockOverrides = {};
jest.mock("../../../common/utils/httpClient", () => ({
  httpClient: {
    get: jest.fn((url) =>
      url in mockOverrides
        ? mockOverrides[url]()
        : Promise.resolve({ data: mockResponses[url] }),
    ),
  },
}));
jest.mock("../../../common/utils/networkErrorNotifier", () => ({
  networkErrorNotifier: { notify: jest.fn() },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const NOT_FOUND = "Not found. It may have been deleted.";

const axiosError = (message, fields) =>
  Object.assign(new Error(message), { isAxiosError: true, ...fields });

const serverError = axiosError("Request failed with status code 500", {
  response: { status: 500, data: "boom" },
});

const networkFailure = axiosError("Network Error", { code: "ERR_NETWORK" });

const dashboards = Array.from({ length: 25 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return { uuid: `dash-${number}`, name: `Dashboard ${number}` };
});

const operationalModules = {
  subjectTypes: [{ uuid: "st-1", name: "Household" }],
  programs: [{ uuid: "pr-1", name: "Pregnancy" }],
  encounterTypes: [{ uuid: "et-1", name: "Home visit" }],
};

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

const openDashboard = (dashboardUUID) => ({
  action: "OpenDashboard",
  actionDetailDashboardUUID: dashboardUUID,
});

const nestedCard = (overrides) =>
  resource({
    nested: true,
    count: 2,
    action: "ViewSubjectProfile",
    ...overrides,
  });

const doVisitDetails = {
  action: "DoVisit",
  actionDetailSubjectTypeUUID: "st-1",
  actionDetailProgramUUID: "pr-1",
  actionDetailEncounterTypeUUID: "et-1",
  actionDetailVisitType: "Scheduled",
  onActionCompletion: "goToSubjectProfile",
};

const markAttendanceDetails = {
  action: "MarkAttendance",
  actionDetailSubjectTypeUUID: "group-1",
  actionDetailAttendanceTypeUUID: "at-1",
  onActionCompletion: "goToSourceScreen",
};

const doVisitCard = customDataCard(doVisitDetails);

const standardCard = resource({
  query: null,
  action: "ViewSubjectProfile",
  standardReportCardType: {
    id: 3,
    uuid: "type-scheduled-visits",
    name: "Scheduled visits",
    description: "Scheduled visits",
    type: "ScheduledVisits",
    voided: false,
  },
});

let container;
let root;

const openDetails = async (cardResource) => {
  mockResponses["/web/reportCard/5"] = cardResource;
  await act(async () => root.render(<ReportCardShow />));
};

const requestedUrls = () => httpClient.get.mock.calls.map(([url]) => url);

const rowValue = (label) =>
  [...container.querySelectorAll("label")]
    .find((element) => element.textContent === label)
    ?.parentElement.querySelector(":scope > span")?.textContent;

beforeEach(() => {
  jest.clearAllMocks();
  mockResponses = {
    "/web/dashboard": dashboards,
    "/web/operationalModules": operationalModules,
  };
  mockOverrides = {};
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Open dashboard on the card details page", () => {
  it("shows Open dashboard and the dashboard's name on a Custom Data Card", async () => {
    await openDetails(customDataCard(openDashboard("dash-02")));

    expect(container.textContent).toContain("Open dashboard");
    expect(container.textContent).toContain("Dashboard 02");
    expect(rowValue("Dashboard")).toBe("Dashboard 02");
    expect(container.textContent).not.toContain("View subject profile");
  });

  it("shows Open dashboard and the dashboard's name on a Custom Design Card", async () => {
    await openDetails(customDesignCard(openDashboard("dash-02")));

    expect(container.textContent).toContain("Open dashboard");
    expect(container.textContent).toContain("Dashboard 02");
    expect(rowValue("Dashboard")).toBe("Dashboard 02");
    expect(container.textContent).not.toContain("View subject profile");
  });

  it("shows no action on a Custom Design Card without one", async () => {
    await openDetails(customDesignCard());

    expect(container.textContent).toContain("Fully custom card");
    expect(container.textContent).not.toContain("Open dashboard");
    expect(rowValue("Dashboard")).toBeUndefined();
    expect(container.textContent).not.toContain("View subject profile");
  });

  it("still names a Do visit card's action Do visit", async () => {
    await openDetails(doVisitCard);

    expect(container.textContent).toContain("Do visit");
  });

  it("shows Open dashboard and a not-found message when the target is not in the list", async () => {
    await openDetails(customDataCard(openDashboard("dash-gone")));

    expect(container.textContent).toContain("Open dashboard");
    expect(rowValue("Dashboard")).toBe(NOT_FOUND);
    expect(container.textContent).not.toContain("dash-gone");
    expect(container.textContent).not.toMatch(/Dashboard \d\d/);
  });

  it("shows no not-found message while the dashboard list is still loading", async () => {
    let answerDashboards;
    const dashboardsRequest = new Promise((resolve) => {
      answerDashboards = resolve;
    });
    mockOverrides["/web/dashboard"] = () => dashboardsRequest;
    await openDetails(customDataCard(openDashboard("dash-gone")));

    expect(requestedUrls()).toContain("/web/dashboard");
    expect(rowValue("Action")).toBe("Open dashboard");
    expect(rowValue("Dashboard")).toBe("");
    expect(container.textContent).not.toContain("Not found");

    await act(async () => answerDashboards({ data: dashboards }));

    expect(rowValue("Dashboard")).toBe(NOT_FOUND);
  });

  it("keeps the page and leaves the row empty when the dashboard list fails with a server error", async () => {
    mockOverrides["/web/dashboard"] = () => Promise.reject(serverError);
    await openDetails(customDataCard(openDashboard("dash-gone")));

    expect(requestedUrls()).toContain("/web/dashboard");
    expect(rowValue("Action")).toBe("Open dashboard");
    expect(rowValue("Dashboard")).toBe("");
    expect(container.textContent).not.toContain("Not found");
    expect(networkErrorNotifier.notify).not.toHaveBeenCalled();
  });

  it("shows the network message when the dashboard list cannot be reached", async () => {
    mockOverrides["/web/dashboard"] = () => Promise.reject(networkFailure);
    await openDetails(customDataCard(openDashboard("dash-gone")));

    expect(requestedUrls()).toContain("/web/dashboard");
    expect(rowValue("Action")).toBe("Open dashboard");
    expect(rowValue("Dashboard")).toBe("");
    expect(container.textContent).not.toContain("Not found");
    expect(networkErrorNotifier.notify).toHaveBeenCalledTimes(1);
  });

  it("shows no Action row on a Custom Design Card with an old action that is not Open dashboard", async () => {
    await openDetails(
      customDesignCard({
        action: "DoVisit",
        actionDetailSubjectTypeUUID: "st-1",
        actionDetailEncounterTypeUUID: "et-1",
        actionDetailVisitType: "Scheduled",
      }),
    );

    expect(container.textContent).toContain("Fully custom card");
    expect(container.textContent).not.toContain("Do visit");
    expect(container.textContent).not.toContain("View subject profile");
    expect(container.textContent).not.toContain("Open dashboard");
    expect(rowValue("Dashboard")).toBeUndefined();
  });

  it("fetches the dashboards only for a card that opens one", async () => {
    await openDetails(doVisitCard);

    expect(requestedUrls()).toContain("/web/operationalModules");
    expect(requestedUrls()).not.toContain("/web/dashboard");

    httpClient.get.mockClear();
    await act(async () => root.unmount());
    root = createRoot(container);
    await openDetails(customDataCard(openDashboard("dash-02")));

    expect(requestedUrls()).toContain("/web/dashboard");
  });

  it.each([
    [
      "a nested View subject profile card",
      nestedCard(),
      "View subject profile",
    ],
    ["a nested Do visit card", nestedCard(doVisitDetails), "Do visit"],
    [
      "a Custom Data View subject profile card",
      customDataCard(),
      "View subject profile",
    ],
    [
      "a Custom Data Mark attendance card",
      customDataCard(markAttendanceDetails),
      "View subject profile",
    ],
  ])("shows %s's action as before", async (_cardName, card, actionLabel) => {
    await openDetails(card);

    expect(rowValue("Action")).toBe(actionLabel);
    expect(container.textContent).not.toContain("Open dashboard");
    expect(rowValue("Dashboard")).toBeUndefined();
    expect(requestedUrls()).not.toContain("/web/dashboard");
  });

  it("shows no Action row on a Standard card", async () => {
    await openDetails(standardCard);

    expect(rowValue("Card Type")).toBe("Standard Report Card");
    expect(rowValue("Action")).toBeUndefined();
    expect(requestedUrls()).not.toContain("/web/dashboard");
  });
});

describe("Approve or reject on the card details page", () => {
  it.each([
    ["Pending", "Pending approval"],
    ["Approved", "Approved"],
    ["Rejected", "Rejected"],
  ])("shows Approve or reject and the %s state on a Custom Data Card", async (status, label) => {
    await openDetails(customDataCard({ action: "ApproveReject", actionDetailApprovalStatus: status }));

    expect(rowValue("Action")).toBe("Approve or reject");
    expect(rowValue("Approval Status")).toBe(label);
    expect(rowValue("Dashboard")).toBeUndefined();
  });

  it("shows Approve or reject and its state on a nested card", async () => {
    await openDetails(nestedCard({ action: "ApproveReject", actionDetailApprovalStatus: "Rejected" }));

    expect(rowValue("Action")).toBe("Approve or reject");
    expect(rowValue("Approval Status")).toBe("Rejected");
  });

  it("shows no Approval Status row for another action", async () => {
    await openDetails(customDataCard(openDashboard("dash-02")));

    expect(rowValue("Approval Status")).toBeUndefined();
  });
});
