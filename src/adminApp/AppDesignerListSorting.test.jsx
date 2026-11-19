import { act } from "react";
import { createRoot } from "react-dom/client";
import { httpClient } from "common/utils/httpClient";
import SubjectTypesList from "./SubjectType/SubjectTypesList";
import ProgramList from "./Program/ProgramList";
import EncounterTypeList from "./EncounterType/EncounterTypeList";
import FormListing from "../formDesigner/components/FormListing";
import ReportingViews from "../formDesigner/components/ReportingViews/ReportingViews";
import ReportCardList from "../formDesigner/components/ReportCard/ReportCardList";
import DashboardList from "../formDesigner/components/Dashboard/DashboardList";
import DownloadableContentList from "./DownloadableContent/DownloadableContentList";
import DownloadableContentService from "./DownloadableContent/DownloadableContentService";
import RuleFailureTelemetryList from "../formDesigner/components/RuleFailureTelemetry/RuleFailureTelemetryList";

jest.mock("react-admin", () => ({ Title: () => null }));

jest.mock("../common/components/DocumentationContainer", () => ({
  DocumentationContainer: ({ children }) => children,
}));

jest.mock("react-redux", () => ({
  useSelector: (selector) => selector({ app: { userInfo: globalThis.testUserInfo ?? { privileges: [] }, organisation: {} } }),
  useDispatch: () => jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/", search: "" }),
}));

jest.mock("common/utils/httpClient", () => ({
  httpClient: { get: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

jest.mock("adminApp/components/AvniMaterialTable", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => {
      globalThis.lastTableProps = props;
      return null;
    }),
  };
});

jest.mock("./DownloadableContent/DownloadableContentService", () => ({
  __esModule: true,
  default: { getAll: jest.fn(), delete: jest.fn() },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const render = async (element) => {
  await act(async () => root.render(element));
  return globalThis.lastTableProps;
};

const sortableHeaders = (columns) =>
  columns.filter((column) => column.enableSorting !== false).map((column) => column.header);

const lastUrl = () => {
  const call = httpClient.get.mock.calls.at(-1);
  return call[1]?.params ? call[1].params : decodeURIComponent(call[0]);
};

beforeEach(() => {
  globalThis.lastTableProps = undefined;
  httpClient.get.mockReset();
  httpClient.get.mockResolvedValue({ data: { formMappings: [], subjectTypes: [] } });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  globalThis.testUserInfo = undefined;
  await act(async () => root.unmount());
  container.remove();
});

describe("server-sorted App Designer lists show a sort arrow only on columns the server can sort", () => {
  it("Subject Types: the registration form cannot be sorted", async () => {
    const { columns } = await render(<SubjectTypesList />);

    expect(sortableHeaders(columns)).toEqual(["Name", "Type", "Organization Id"]);
  });

  it("Programs: name and colour sort; colour is sorted on the programme's own colour", async () => {
    const { columns, fetchData } = await render(<ProgramList />);
    expect(sortableHeaders(columns)).toEqual(["Name", "Colour"]);

    const colourColumn = columns.find((column) => column.header === "Colour");
    await fetchData({ page: 0, pageSize: 10, orderBy: colourColumn.id ?? colourColumn.accessorKey, orderDirection: "desc" });

    expect(lastUrl()).toBe("/web/program?size=10&page=0&sort=program.colour,desc");

    await fetchData({ page: 0, pageSize: 10, orderBy: "bogus", orderDirection: "desc" });
    expect(lastUrl()).toBe("/web/program?size=10&page=0");
  });

  it("Encounter Types: only the name sorts", async () => {
    const { columns } = await render(<EncounterTypeList />);

    expect(sortableHeaders(columns)).toEqual(["Name"]);
  });

  it("Forms: name, form type and last modified sort; form type is sent to the server", async () => {
    httpClient.get.mockResolvedValue({ data: { _embedded: { basicFormDetailses: [] } } });
    const { columns, fetchData } = await render(<FormListing />);
    expect(sortableHeaders(columns)).toEqual(["Name", "Form Type", "Last Modified"]);

    await fetchData({ page: 0, pageSize: 10, orderBy: "formType", orderDirection: "asc" });

    expect(lastUrl()).toBe("/web/forms?size=10&page=0&sort=formType,asc");
  });
});

describe("App Designer lists sorted in the browser", () => {
  it("Reporting Views: view names sort ignoring case", async () => {
    httpClient.get.mockResolvedValue({
      data: [{ viewName: "Zed" }, { viewName: "abc" }, { viewName: "Mid" }],
    });
    await render(<ReportingViews />);
    await act(async () => {});

    const { data } = await globalThis.lastTableProps.fetchData({
      page: 0,
      pageSize: 10,
      orderBy: "viewName",
      orderDirection: "asc",
    });

    expect(data.map((view) => view.viewName)).toEqual(["abc", "Mid", "Zed"]);
  });

  it("Reporting Views: the table waits for the views instead of showing an empty list", async () => {
    let resolveViews;
    httpClient.get.mockReturnValue(new Promise((resolve) => (resolveViews = resolve)));
    await render(<ReportingViews />);
    expect(globalThis.lastTableProps).toBeUndefined();

    await act(async () => resolveViews({ data: [{ viewName: "abc" }] }));
    const { data } = await globalThis.lastTableProps.fetchData({ page: 0, pageSize: 10 });
    expect(data.map((view) => view.viewName)).toEqual(["abc"]);
  });

  it("Reporting Views: a deleted view leaves the list", async () => {
    httpClient.get.mockResolvedValue({ data: [{ viewName: "keep_me" }, { viewName: "delete_me" }] });
    httpClient.delete.mockResolvedValue({ status: 200 });
    jest.spyOn(window, "confirm").mockReturnValue(true);
    globalThis.testUserInfo = { hasAllPrivileges: true };
    await render(<ReportingViews />);
    await act(async () => {});
    httpClient.get.mockResolvedValue({ data: [{ viewName: "keep_me" }] });

    await act(async () => globalThis.lastTableProps.actions[0].onClick(null, { original: { viewName: "delete_me" } }));
    const { data } = await globalThis.lastTableProps.fetchData({ page: 0, pageSize: 10 });

    expect(httpClient.delete).toHaveBeenCalledWith("/reportingView/delete_me");
    expect(data.map((view) => view.viewName)).toEqual(["keep_me"]);
    window.confirm.mockRestore();
  });

  it("Offline Report Card: Standard Report Card sorts on the card type's name", async () => {
    httpClient.get.mockResolvedValue({
      data: [
        { name: "C", standardReportCardType: { name: "Total" } },
        { name: "A" },
        { name: "B", standardReportCardType: { name: "Due checklist" } },
      ],
    });
    await render(<ReportCardList />);
    await act(async () => {});
    const { columns, fetchData } = globalThis.lastTableProps;
    const cardTypeColumn = columns.find((column) => column.header === "Standard Report Card");

    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { data } = await fetchData({ page: 0, pageSize: 10, orderBy: cardTypeColumn.id, orderDirection: "asc" });
    expect(cardTypeColumn.accessorFn({ name: "custom card" })).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();

    expect(data.map((card) => card.name)).toEqual(["A", "B", "C"]);
  });

  it("Offline Dashboard: name and description sort", async () => {
    httpClient.get.mockResolvedValue({ data: [] });
    await render(<DashboardList />);
    await act(async () => {});

    expect(sortableHeaders(globalThis.lastTableProps.columns)).toEqual(["Name", "Description"]);
  });

  it("Downloadable Content: searches, sorts and pages", async () => {
    DownloadableContentService.getAll.mockResolvedValue([
      ...Array.from({ length: 11 }, (_, i) => ({ name: `Guide ${String(i + 1).padStart(2, "0")}` })),
      { name: "Atlas" },
      { name: "guide deleted", voided: true },
    ]);
    await render(<DownloadableContentList />);
    await act(async () => {});
    const table = globalThis.lastTableProps;

    const firstPage = await table.fetchData({ page: 0, pageSize: 10, orderBy: "name", orderDirection: "desc", globalFilter: "GUIDE" });
    const secondPage = await table.fetchData({ page: 1, pageSize: 10, orderBy: "name", orderDirection: "desc", globalFilter: "GUIDE" });

    expect(firstPage.totalCount).toBe(11);
    expect(firstPage.data.map((item) => item.name)).toHaveLength(10);
    expect(firstPage.data[0].name).toBe("Guide 11");
    expect(secondPage.data.map((item) => item.name)).toEqual(["Guide 01"]);
    expect(table.enableColumnFilters).toBe(false);
    expect(DownloadableContentService.getAll).toHaveBeenCalledTimes(1);
  });

  it("Downloadable Content: if the list cannot be reloaded after a delete, the rows stay and the user is told", async () => {
    DownloadableContentService.getAll.mockReset();
    DownloadableContentService.getAll.mockResolvedValueOnce([{ uuid: "a", name: "Atlas" }, { uuid: "g", name: "Guide" }]);
    DownloadableContentService.getAll.mockRejectedValueOnce(new Error("500"));
    DownloadableContentService.delete.mockResolvedValue({});
    jest.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    globalThis.testUserInfo = { hasAllPrivileges: true };
    await render(<DownloadableContentList />);
    await act(async () => {});

    await act(async () => globalThis.lastTableProps.actions[0 + 1].onClick(null, { original: { uuid: "g", name: "Guide" } }));
    const { data } = await globalThis.lastTableProps.fetchData({ page: 0, pageSize: 10 });

    expect(data.map((item) => item.name)).toEqual(["Atlas", "Guide"]);
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("could not be reloaded"));
    window.confirm.mockRestore();
    alertSpy.mockRestore();
    console.error.mockRestore();
  });

  it("Rule Failures: Status sorts on isClosed and the search box is hidden", async () => {
    httpClient.get.mockResolvedValue({ data: { content: [] } });
    const table = await render(<RuleFailureTelemetryList />);

    const statusColumn = table.columns.find((column) => column.header === "Status");
    await table.fetchData({ page: 0, pageSize: 10, orderBy: statusColumn.id ?? statusColumn.accessorKey, orderDirection: "asc" });

    expect(lastUrl().sort).toBe("isClosed,asc");
    expect(table.enableGlobalFilter).toBe(false);
  });

  it.each([
    ["closed", "isClosed,desc"],
    ["closedDateTime", "closedDateTime,desc"],
    ["bogus", undefined]
  ])("Rule Failures: a saved sortBy=%s is sent as %s", async (orderBy, expectedSort) => {
    httpClient.get.mockResolvedValue({ data: { content: [] } });
    const table = await render(<RuleFailureTelemetryList />);

    await table.fetchData({ page: 0, pageSize: 10, orderBy, orderDirection: "desc" });

    expect(lastUrl().sort).toBe(expectedSort);
  });

  it("Rule Failures: every sortable column has a server sort field", async () => {
    httpClient.get.mockResolvedValue({ data: { content: [] } });
    const table = await render(<RuleFailureTelemetryList />);
    const sortableIds = table.columns.filter((column) => column.enableSorting !== false).map((column) => column.id ?? column.accessorKey);

    for (const id of sortableIds) {
      await table.fetchData({ page: 0, pageSize: 10, orderBy: id, orderDirection: "asc" });
      expect(lastUrl().sort).toMatch(/,asc$/);
    }
  });
});
