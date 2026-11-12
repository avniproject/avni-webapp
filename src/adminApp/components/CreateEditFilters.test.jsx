import { act } from "react";
import { createRoot } from "react-dom/client";
import { CreateEditFilters } from "./CreateEditFilters";
import { httpClient } from "common/utils/httpClient";

jest.mock("react-admin", () => ({ Title: () => null }));
jest.mock("../../common/components/DocumentationContainer", () => ({
  DocumentationContainer: ({ children }) => children,
}));
jest.mock("../../common/components/ToolTip", () => ({ ToolTip: () => null }));
jest.mock("../CustomFilters", () => ({ omitTableData: (x) => x }));
jest.mock("../../common/service", () => ({
  __esModule: true,
  default: { fetchSubjectTypes: () => Promise.resolve([]) },
}));
jest.mock("common/utils/httpClient", () => ({
  httpClient: { get: jest.fn(), post: jest.fn() },
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en", t: (key) => key },
  }),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const operationalModules = {
  subjectTypes: [{ uuid: "st-person", name: "Person" }],
  programs: [],
  encounterTypes: [],
};

const conceptFilter = (conceptDataType) => ({
  titleKey: "Old filter",
  subjectTypeUUID: "st-person",
  type: "Concept",
  scope: "registration",
  conceptName: "Has Red",
  conceptUUID: "c-red",
  conceptDataType,
  widget: "Default",
});

const CONCEPTS = [
  { name: "Has Red", uuid: "c-red", dataType: "NA" },
  { name: "Has notes", uuid: "c-notes", dataType: "Notes" },
  { name: "Has group", uuid: "c-group", dataType: "QuestionGroup" },
  { name: "Has date-time", uuid: "c-dt", dataType: "DateTime" },
  { name: "Has encounter", uuid: "c-enc", dataType: "Encounter" },
  { name: "Has location", uuid: "c-loc", dataType: "Location" },
];

let container;
let root;

const renderEditor = async (filterType, selectedFilter = null) => {
  await act(async () =>
    root.render(
      <CreateEditFilters
        selectedFilter={selectedFilter}
        title="Edit filter"
        filterType={filterType}
        operationalModules={operationalModules}
        settings={{
          uuid: "s",
          settings: { searchFilters: [], myDashboardFilters: [] },
        }}
      />,
    ),
  );
};

const note = () =>
  [...container.querySelectorAll("p")].find((p) =>
    p.textContent.startsWith("Search leaves this filter out"),
  );

// Types into the concept picker and returns the names it offers.
const offeredConcepts = async (text) => {
  const conceptInput = [...container.querySelectorAll("div")]
    .find(
      (d) =>
        d.style.width === "400px" && d.textContent.includes("Select Concept"),
    )
    .querySelector("input");
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  ).set;
  await act(async () => {
    setValue.call(conceptInput, text);
    conceptInput.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => new Promise((r) => setTimeout(r, 0)));
  return [...container.querySelectorAll("[class*='option']")].map(
    (o) => o.textContent,
  );
};

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  httpClient.get.mockReset();
  httpClient.get.mockResolvedValue({ data: CONCEPTS });
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Concept search filter on a type search can't filter on", () => {
  it("notes that search leaves out a saved filter on an answer concept (NA)", async () => {
    await renderEditor("searchFilters", conceptFilter("NA"));

    expect(note().textContent).toBe(
      "Search leaves this filter out, because it can't search on NA concepts. Choose a concept of type Coded, Text, Id, Notes, Numeric, Date, DateTime, Time, or delete this filter.",
    );
  });

  it.each(["Boolean", "QuestionGroup", "Encounter"])(
    "notes it for a saved %s filter too",
    async (type) => {
      await renderEditor("searchFilters", conceptFilter(type));

      expect(note().textContent).toContain(`search on ${type} concepts`);
    },
  );

  it("notes it for a filter saved without the concept's type", async () => {
    await renderEditor("searchFilters", conceptFilter(undefined));

    expect(note().textContent).toContain(
      "because it can't search on a concept saved without its type.",
    );
  });

  it("adds no note before a concept is chosen", async () => {
    await renderEditor("searchFilters", {
      ...conceptFilter(undefined),
      conceptName: undefined,
    });

    expect(note()).toBeUndefined();
  });

  it("adds no note for a supported type", async () => {
    await renderEditor("searchFilters", conceptFilter("Notes"));

    expect(note()).toBeUndefined();
  });

  it("adds no note on My Dashboard filters, which keep their own types", async () => {
    await renderEditor("myDashboardFilters", conceptFilter("NA"));

    expect(note()).toBeUndefined();
  });
});

describe("concept picker", () => {
  it("offers only searchable types on a Search Filter", async () => {
    await renderEditor("searchFilters", conceptFilter("Notes"));

    expect(await offeredConcepts("has")).toEqual([
      "Has notes",
      "Has date-time",
    ]);
  });

  it("keeps offering the other types on a My Dashboard filter", async () => {
    await renderEditor("myDashboardFilters", conceptFilter("Notes"));

    expect(await offeredConcepts("has")).toEqual([
      "Has Red",
      "Has notes",
      "Has group",
      "Has date-time",
      "Has encounter",
    ]);
  });
});

describe("filter type list", () => {
  const programFilter = (titleKey, subjectTypeUUID = "st-person") => ({
    titleKey,
    subjectTypeUUID,
    type: "Program",
  });

  const offeredTypes = async (filters, selectedFilter, modules = operationalModules) => {
    await act(async () =>
      root.render(
        <CreateEditFilters
          selectedFilter={selectedFilter}
          title="Edit filter"
          filterType="searchFilters"
          operationalModules={modules}
          settings={{
            uuid: "s",
            settings: { searchFilters: filters, myDashboardFilters: [] },
          }}
        />,
      ),
    );
    const typeInput = [...container.querySelectorAll("div")]
      .find(
        (d) => d.style.width === "400px" && d.textContent.includes("Type") && !d.textContent.includes("Subject Type"),
      )
      .querySelector("input");
    await act(async () => {
      typeInput.focus();
      typeInput.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
    });
    return [...container.querySelectorAll("[class*='option']")].map(
      (o) => o.textContent,
    );
  };

  it("leaves out Program when the subject type already has a Program filter", async () => {
    const existing = programFilter("Programmes");
    const types = await offeredTypes([existing, conceptFilter("Notes")], conceptFilter("Notes"));

    expect(types).toContain("Concept");
    expect(types).not.toContain("Program");
  });

  it("offers Program when editing the subject type's own Program filter", async () => {
    const existing = programFilter("Programmes");
    const types = await offeredTypes([existing], existing);

    expect(types).toContain("Program");
  });

  const withProgrammes = {
    subjectTypes: [
      { uuid: "st-person", name: "Person" },
      { uuid: "st-animal", name: "Animal" },
    ],
    programs: [{ uuid: "p-child", name: "Child" }],
    encounterTypes: [],
    formMappings: [
      { formType: "ProgramEnrolment", subjectTypeUUID: "st-person", programUUID: "p-child" },
    ],
  };
  const animalFilter = { ...conceptFilter("Notes"), subjectTypeUUID: "st-animal" };

  it("leaves out Program for a subject type that enrols into no programme", async () => {
    const types = await offeredTypes([animalFilter], animalFilter, withProgrammes);

    expect(types).toContain("Concept");
    expect(types).not.toContain("Program");
  });

  it("offers Program for a subject type that enrols into a programme", async () => {
    const types = await offeredTypes([conceptFilter("Notes")], conceptFilter("Notes"), withProgrammes);

    expect(types).toContain("Program");
  });

  it("keeps Program on a saved Program filter of a subject type that enrols into no programme any more", async () => {
    const saved = programFilter("Programmes", "st-animal");
    const types = await offeredTypes([saved], saved, withProgrammes);

    expect(types).toContain("Program");
  });

  it("offers Program when only another subject type has one", async () => {
    const types = await offeredTypes([programFilter("Programmes", "st-other"), conceptFilter("Notes")], conceptFilter("Notes"));

    expect(types).toContain("Program");
  });
});
