import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { SearchForm } from "./SearchFilterForm";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en", t: (key) => key },
  }),
}));

jest.mock("../../../common/service", () => ({
  __esModule: true,
  default: {
    fetchSubjectTypes: () =>
      Promise.resolve([
        { uuid: "st-person", type: "Person" },
        { uuid: "st-house", type: "Household" },
      ]),
  },
}));

jest.mock("../../../common/store", () => ({ store: { dispatch: jest.fn() } }));
jest.mock("../../../common/components/AddressLevelsByType", () => () => null);
jest.mock("../../components/SubjectTypeIcon", () => () => null);

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const operationalModules = {
  subjectTypes: [
    { uuid: "st-person", name: "Person" },
    { uuid: "st-house", name: "Household" },
  ],
  programs: [],
  formMappings: [],
};

const conceptFilter = (subjectTypeUUID, titleKey, conceptDataType) => ({
  type: "Concept",
  titleKey,
  subjectTypeUUID,
  conceptUUID: `${titleKey}-uuid`,
  conceptName: titleKey,
  conceptDataType,
  scope: "registration",
  widget: "Default",
});

// "Has Red" is an answer concept (NA): App Designer used to offer it, and search crashed on it (avni-webapp#965).
const searchFilters = [
  conceptFilter("st-person", "Has Red", "NA"),
  conceptFilter("st-person", "Mother name", "Text"),
  conceptFilter("st-person", "Is literate", "Boolean"),
  conceptFilter("st-person", "Household notes", "Notes"),
  conceptFilter("st-house", "Members", "QuestionGroup"),
  conceptFilter("st-house", "House number", "Id"),
];

let container;
let root;
let onSearch;

const renderForm = async (searchRequest = {}) => {
  onSearch = jest.fn();
  await act(async () =>
    root.render(
      <MemoryRouter>
        <SearchForm
          operationalModules={operationalModules}
          genders={[]}
          organisationConfigs={{
            organisationConfig: { searchFilters },
            conceptList: [],
          }}
          searchRequest={{ subjectType: "st-person", ...searchRequest }}
          onSearch={onSearch}
        />
      </MemoryRouter>,
    ),
  );
};

const textField = (titleKey) =>
  container.querySelector(`input[id='${titleKey}']`);
const button = (text) =>
  [...container.querySelectorAll("button")].find((b) => b.textContent === text);
const search = async () => {
  await act(async () => button("search").click());
  return onSearch.mock.calls[0][0];
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

describe("search with a concept filter it can't show", () => {
  it("opens, leaves that filter out and shows the others", async () => {
    await renderForm();

    expect(textField("Mother name")).not.toBeNull();
    expect(textField("Household notes")).not.toBeNull();
    expect(container.textContent).not.toContain("Has Red");
    expect(container.textContent).not.toContain("Is literate");
  });

  it("searches on the other concept filters", async () => {
    await renderForm({
      concept: [{ uuid: "Mother name-uuid", dataType: "Text", value: "asha" }],
    });

    expect(textField("Mother name").value).toBe("asha");
    const request = await search();
    expect(request.concept.map((c) => c.uuid)).toEqual(["Mother name-uuid"]);
  });

  it("opens when the user switches to a subject type with such a filter", async () => {
    await renderForm();
    await act(async () => button("Household").click());

    expect(textField("House number")).not.toBeNull();
    expect(textField("Mother name")).toBeNull();
    expect(container.textContent).not.toContain("Members");
  });

  it("opens when a saved search starts on that subject type", async () => {
    await renderForm({ subjectType: "st-house" });

    expect(textField("House number")).not.toBeNull();
  });
});
