import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import AvniMaterialTable from "./AvniMaterialTable";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const columns = [
  { header: "Name", accessorKey: "name" },
  { header: "Description", accessorKey: "description" },
  { header: "Needs Key", accessorKey: "needsKey" }
];

let container;
let root;
let currentSearch;

const LocationSpy = () => {
  currentSearch = useLocation().search;
  return null;
};

const renderTable = async (fetchData, initialEntry = "/list") => {
  await act(async () =>
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <LocationSpy />
        <AvniMaterialTable columns={columns} fetchData={fetchData} options={{ sorting: true, pageSize: 10 }} />
      </MemoryRouter>
    )
  );
};

const sortLabel = header =>
  [...container.querySelectorAll("th")].find(th => th.textContent.includes(header)).querySelector(".MuiTableSortLabel-root");

const clickSort = async header => {
  await act(async () => sortLabel(header).click());
};

const lastSort = fetchData => {
  const { orderBy, orderDirection } = fetchData.mock.calls.at(-1)[0];
  return orderBy ? `${orderBy} ${orderDirection}` : "none";
};

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("AvniMaterialTable sorting", () => {
  it.each([
    ["a blank first row", [{ name: "B" }, { name: "A", description: "x" }]],
    ["a number/boolean first row", [{ name: "B", description: 3, needsKey: true }]],
    ["a text first row", [{ name: "B", description: "x", needsKey: "yes" }]]
  ])("every column goes ascending → descending → no sort with %s", async (_, rows) => {
    const fetchData = jest.fn().mockResolvedValue({ data: rows, totalCount: rows.length });
    await renderTable(fetchData);

    for (const [header, id] of [
      ["Description", "description"],
      ["Needs Key", "needsKey"]
    ]) {
      await clickSort(header);
      expect(lastSort(fetchData)).toBe(`${id} asc`);
      await clickSort(header);
      expect(lastSort(fetchData)).toBe(`${id} desc`);
      await clickSort(header);
      expect(lastSort(fetchData)).toBe("none");
    }
  });

  it.each([
    [["Name", "Name"], "name desc", "?sortBy=name&sortDesc=desc"],
    [["Name", "Name", "Name"], "none", ""],
    [["Name", "Description"], "description asc", "?sortBy=description"]
  ])("clicks faster than a re-render on %j count every click", async (headers, expectedSort, expectedSearch) => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderTable(fetchData);
    const labels = headers.map(sortLabel);

    await act(async () => labels.forEach(label => label.click()));

    expect(lastSort(fetchData)).toBe(expectedSort);
    expect(currentSearch).toBe(expectedSearch);
  });

  it("keeps the sort and search in the address, so a refresh fetches the same sorted, filtered page", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderTable(fetchData);
    await clickSort("Description");
    await clickSort("Description");
    expect(currentSearch).toBe("?sortBy=description&sortDesc=desc");

    await act(async () => root.unmount());
    root = createRoot(container);
    const afterRefresh = jest.fn().mockResolvedValue({ data: Array(10).fill({ name: "B" }), totalCount: 11 });
    await renderTable(afterRefresh, "/list?page=1&sortBy=description&sortDesc=desc&search=guide");

    expect(afterRefresh.mock.calls.map(([params]) => params)).toEqual([
      expect.objectContaining({ page: 1, orderBy: "description", orderDirection: "desc", globalFilter: "guide" })
    ]);
    expect(currentSearch).toBe("?page=1&sortBy=description&sortDesc=desc&search=guide");
  });

  it("moves a saved page that no longer exists to the last page once the rows arrive", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 3 });
    await renderTable(fetchData, "/list?page=4");

    expect(fetchData.mock.calls.at(-1)[0].page).toBe(0);
    expect(currentSearch).toBe("");
  });
});

describe("AvniMaterialTable requests", () => {
  const pageButton = label => container.querySelector(`button[aria-label="${label}"]`);

  it("asks the server once when the list opens", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 25 });
    await renderTable(fetchData, "/list?sortBy=name");

    expect(fetchData).toHaveBeenCalledTimes(1);
  });

  it("asks the server once per sort click", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 25 });
    await renderTable(fetchData);
    fetchData.mockClear();

    await clickSort("Name");

    expect(fetchData).toHaveBeenCalledTimes(1);
  });

  it("changing the sort on page 2 fetches only page 1 with the new sort", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: Array(10).fill({ name: "B" }), totalCount: 25 });
    await renderTable(fetchData, "/list?page=1");
    fetchData.mockClear();

    await clickSort("Name");

    expect(fetchData.mock.calls.map(([params]) => `${params.page} ${params.orderBy ?? "none"}`)).toEqual(["0 name"]);
    expect(currentSearch).toBe("?sortBy=name");
  });

  it("asks the server once per page click", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: Array(10).fill({ name: "B" }), totalCount: 25 });
    await renderTable(fetchData, "/list?sortBy=name");
    fetchData.mockClear();

    await act(async () => pageButton("Go to page 2").click());

    expect(fetchData.mock.calls.map(([params]) => `${params.page} ${params.orderBy}`)).toEqual(["1 name"]);
    expect(currentSearch).toBe("?page=1&sortBy=name");
  });

  it("asks the server once for a typed search, from page 1", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: Array(10).fill({ name: "B" }), totalCount: 25 });
    await renderTable(fetchData, "/list?page=1&search=a");
    fetchData.mockClear();
    const input = container.querySelector("input[placeholder='Search']");

    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "ab");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => new Promise(resolve => setTimeout(resolve, 600)));

    expect(fetchData.mock.calls.map(([params]) => `${params.page} ${params.globalFilter}`)).toEqual(["0 ab"]);
  });

  it.each(["-2", "1.5", "abc"])("treats page=%s typed into the address as page 1", async page => {
    const fetchData = jest.fn().mockResolvedValue({ data: Array(10).fill({ name: "B" }), totalCount: 15 });
    await renderTable(fetchData, `/list?page=${page}`);

    fetchData.mock.calls.forEach(([params]) => expect(params.page).toBe(0));
    expect(container.textContent).toContain("1-10 of 15");
  });

  it("shift-clicking a second column replaces the sort instead of adding a second arrow", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderTable(fetchData);

    await clickSort("Name");
    await act(async () =>
      sortLabel("Description").dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: true }))
    );

    expect([...container.querySelectorAll(".MuiTableSortLabel-root[aria-label^='Sorted by']")].map(label => label.getAttribute("aria-label"))).toEqual([
      "Sorted by Description ascending"
    ]);
    expect(lastSort(fetchData)).toBe("description asc");
    expect(currentSearch).toBe("?sortBy=description");
  });

  it("a column-menu Sort ascending right after a click sorts ascending", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderTable(fetchData);
    const nameHeader = [...container.querySelectorAll("th")].find(th => th.textContent.includes("Name"));
    await act(async () => nameHeader.querySelector("button[aria-label='Column Actions']").click());
    const sortAscending = [...document.querySelectorAll("li[role='menuitem']")].find(item =>
      item.textContent.includes("Sort by Name ascending")
    );

    await act(async () => {
      sortLabel("Name").click();
      sortAscending.click();
    });

    expect(lastSort(fetchData)).toBe("name asc");
    expect(currentSearch).toBe("?sortBy=name");
  });

  it("an older request that finishes late neither shows its rows nor hides the loading state", async () => {
    const resolvers = [];
    const fetchData = jest.fn(() => new Promise(resolve => resolvers.push(resolve)));
    await renderTable(fetchData);
    await clickSort("Name");
    expect(resolvers).toHaveLength(2);

    await act(async () => resolvers[0]({ data: [{ name: "stale" }], totalCount: 1 }));
    expect(container.textContent).not.toContain("stale");
    expect(container.querySelector(".MuiSkeleton-root")).not.toBeNull();

    await act(async () => resolvers[1]({ data: [{ name: "sorted" }], totalCount: 1 }));
    expect(container.textContent).toContain("sorted");
    expect(container.querySelector(".MuiSkeleton-root")).toBeNull();
  });

  it("a broken filters value in the address is ignored instead of breaking the page", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderTable(fetchData, "/list?filters=%7Bbad");

    expect(fetchData).toHaveBeenCalledWith(expect.objectContaining({ columnFilters: [] }));
  });

  it("sends the search without spaces around it", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderTable(fetchData, "/list?search=%20guide%20");

    expect(fetchData).toHaveBeenCalledWith(expect.objectContaining({ globalFilter: "guide", search: "guide" }));
  });

  it("clearing the search with its X shows the full list and removes the search from the address", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderTable(fetchData, "/list?sortBy=name&search=guide");
    fetchData.mockClear();

    await act(async () => container.querySelector("button[aria-label='Clear search']").click());

    expect(fetchData.mock.calls.map(([params]) => params.globalFilter)).toEqual([""]);
    expect(currentSearch).toBe("?sortBy=name");
    expect(container.querySelector(".MuiSkeleton-root")).toBeNull();
  });

  it.each([
    ["/list?page=-2&sortBy=name", "?sortBy=name"],
    ["/list?page=abc&sortBy=name&search=x", "?sortBy=name&search=x"],
    ["/list?page=01&sortBy=name", "?page=1&sortBy=name"]
  ])("corrects %s in the address and keeps the other settings", async (entry, expectedSearch) => {
    const fetchData = jest.fn().mockResolvedValue({ data: Array(10).fill({ name: "B" }), totalCount: 25 });
    await renderTable(fetchData, entry);

    expect(currentSearch).toBe(expectedSearch);
  });
});

describe("AvniMaterialTable default sort", () => {
  const DEFAULT_SORTING = [{ id: "description", desc: true }];
  const renderWithDefault = async (fetchData, initialEntry = "/list") => {
    await act(async () =>
      root.render(
        <MemoryRouter initialEntries={[initialEntry]}>
          <LocationSpy />
          <AvniMaterialTable
            columns={columns}
            fetchData={fetchData}
            options={{ sorting: true, pageSize: 10 }}
            defaultSorting={DEFAULT_SORTING}
          />
        </MemoryRouter>
      )
    );
  };
  const arrows = () =>
    [...container.querySelectorAll(".MuiTableSortLabel-root[aria-label^='Sorted by']")].map(label => label.getAttribute("aria-label"));

  it("shows the default sort's arrow and asks for it when the address has no sort", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderWithDefault(fetchData);

    expect(arrows()).toEqual(["Sorted by Description descending"]);
    expect(lastSort(fetchData)).toBe("description desc");
  });

  it("the default column switches between ascending and descending", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderWithDefault(fetchData);

    await clickSort("Description");
    expect(lastSort(fetchData)).toBe("description asc");
    await clickSort("Description");
    expect(lastSort(fetchData)).toBe("description desc");
    await clickSort("Description");
    expect(lastSort(fetchData)).toBe("description asc");
  });

  it("a sort in the address wins over the default", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderWithDefault(fetchData, "/list?sortBy=name");

    expect(arrows()).toEqual(["Sorted by Name ascending"]);
    expect(lastSort(fetchData)).toBe("name asc");
  });

  it("goes back a page when the last row of the last page is deleted", async () => {
    const elevenRows = jest.fn(({ page }) => Promise.resolve({ data: page === 1 ? [{ name: "last" }] : Array(10).fill({ name: "B" }), totalCount: 11 }));
    await renderTable(elevenRows, "/list?page=1");
    expect(container.textContent).toContain("11-11 of 11");

    const tenRows = jest.fn(({ page }) => Promise.resolve({ data: page === 1 ? [] : Array(10).fill({ name: "B" }), totalCount: 10 }));
    await renderTable(tenRows);

    expect(tenRows.mock.calls.at(-1)[0].page).toBe(0);
    expect(container.textContent).toContain("1-10 of 10");
    expect(currentSearch).toBe("");
  });

  it.each([
    ["a column that cannot be sorted", "/list?sortBy=locked&sortDesc=desc"],
    ["a column that does not exist", "/list?sortBy=nothing"]
  ])("ignores sortBy for %s", async (_, entry) => {
    const lockedColumns = [...columns, { header: "Locked", accessorKey: "locked", enableSorting: false }];
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await act(async () =>
      root.render(
        <MemoryRouter initialEntries={[entry]}>
          <LocationSpy />
          <AvniMaterialTable columns={lockedColumns} fetchData={fetchData} options={{ sorting: true, pageSize: 10 }} />
        </MemoryRouter>
      )
    );

    fetchData.mock.calls.forEach(([params]) => expect(params.orderBy).toBeUndefined());
    expect(currentSearch).toBe("");
  });

  it("does not keep reloading when the list passes new column objects on every render", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    const Unmemoised = () => (
      <AvniMaterialTable columns={columns.map(column => ({ ...column }))} fetchData={fetchData} options={{ sorting: true, pageSize: 10 }} />
    );
    await act(async () =>
      root.render(
        <MemoryRouter initialEntries={["/list?sortBy=name"]}>
          <Unmemoised />
        </MemoryRouter>
      )
    );
    await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

    expect(fetchData).toHaveBeenCalledTimes(1);
  });

  it("keeps a sort on a column with a dotted key from the very first request", async () => {
    const dottedColumns = [{ header: "Relationship", accessorKey: "relation.name" }];
    const fetchData = jest.fn().mockResolvedValue({ data: [{ relation: { name: "Father" } }], totalCount: 1 });
    await act(async () =>
      root.render(
        <MemoryRouter initialEntries={["/list?sortBy=relation.name&sortDesc=desc"]}>
          <LocationSpy />
          <AvniMaterialTable columns={dottedColumns} fetchData={fetchData} options={{ sorting: true, pageSize: 10 }} />
        </MemoryRouter>
      )
    );

    expect(fetchData.mock.calls.map(([params]) => `${params.orderBy} ${params.orderDirection}`)).toEqual(["relation.name desc"]);
  });

  it("typing spaces after a search does not ask the server again", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await renderTable(fetchData, "/list?search=abc");
    fetchData.mockClear();
    const input = container.querySelector("input[placeholder='Search']");

    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "abc   ");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => new Promise(resolve => setTimeout(resolve, 600)));

    expect(fetchData).not.toHaveBeenCalled();
  });

  it("a default sort written as a new array on every render does not reload the list", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    const InlineDefault = () => (
      <AvniMaterialTable
        columns={columns}
        fetchData={fetchData}
        options={{ sorting: true, pageSize: 10 }}
        defaultSorting={[{ id: "name", desc: true }]}
      />
    );
    await act(async () =>
      root.render(
        <MemoryRouter initialEntries={["/list"]}>
          <InlineDefault />
        </MemoryRouter>
      )
    );
    await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

    expect(fetchData).toHaveBeenCalledTimes(1);
    expect(lastSort(fetchData)).toBe("name desc");
  });

  it("removes an ignored sortBy from the address but keeps the search and page", async () => {
    const fetchData = jest.fn().mockResolvedValue({ data: Array(10).fill({ name: "B" }), totalCount: 25 });
    await renderTable(fetchData, "/list?page=1&sortBy=gone&sortDesc=desc&search=abc");

    expect(currentSearch).toBe("?page=1&search=abc");
  });

  it("does not treat a column without data, or a header that is not text, as sortable", async () => {
    const odd = [
      { header: "Name", accessorKey: "name" },
      { id: "actionsColumn", header: "Actions", Cell: () => null },
      { header: <span>Fancy</span>, accessorFn: row => row.name }
    ];
    const fetchData = jest.fn().mockResolvedValue({ data: [{ name: "B" }], totalCount: 1 });
    await act(async () =>
      root.render(
        <MemoryRouter initialEntries={["/list?sortBy=actionsColumn"]}>
          <LocationSpy />
          <AvniMaterialTable columns={odd} fetchData={fetchData} options={{ sorting: true, pageSize: 10 }} />
        </MemoryRouter>
      )
    );

    fetchData.mock.calls.forEach(([params]) => expect(params.orderBy).toBeUndefined());
    expect(currentSearch).toBe("");
  });
});
