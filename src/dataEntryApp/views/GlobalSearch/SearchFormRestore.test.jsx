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
      Promise.resolve([{ uuid: "st-person", type: "Person" }]),
  },
}));

jest.mock("../../../common/store", () => ({ store: { dispatch: jest.fn() } }));

jest.mock("../../../common/components/AddressLevelsByType", () => ({
  __esModule: true,
  default: ({ addressLevelsIds }) => (
    <span data-testid="address">{addressLevelsIds.join(",")}</span>
  ),
}));

jest.mock("../../components/SubjectTypeIcon", () => () => null);

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const filter = (type, extra = {}) => ({
  type,
  titleKey: type,
  subjectTypeUUID: "st-person",
  widget: "Default",
  ...extra,
});

const organisationConfigs = {
  organisationConfig: {
    searchFilters: [
      filter("Name"),
      filter("Gender"),
      filter("Address"),
      filter("DateOfBirth"),
      filter("RegistrationDate", { widget: "Range" }),
      filter("Concept", {
        titleKey: "Blood group",
        conceptUUID: "coded-uuid",
        conceptDataType: "Coded",
        scope: "registration",
      }),
      filter("Concept", {
        titleKey: "Remarks",
        conceptUUID: "text-uuid",
        conceptDataType: "Text",
        scope: "registration",
      }),
      filter("Concept", {
        titleKey: "Seen at",
        conceptUUID: "datetime-uuid",
        conceptDataType: "DateTime",
        scope: "registration",
        widget: "Range",
      }),
      filter("Concept", {
        titleKey: "Last visit",
        conceptUUID: "date-uuid",
        conceptDataType: "Date",
        scope: "registration",
        widget: "Range",
      }),
    ],
  },
  conceptList: [
    {
      uuid: "coded-uuid",
      conceptAnswers: [
        { answerConcept: { uuid: "answer-a", name: "A+" } },
        { answerConcept: { uuid: "answer-b", name: "B+" } },
      ],
    },
  ],
};

const savedSearch = {
  subjectType: "st-person",
  name: "Asha",
  age: { minValue: "", maxValue: null },
  dateOfBirth: "1990-04-10",
  includeVoided: true,
  includeDisplayCount: false,
  addressIds: [11, 12],
  concept: [
    {
      uuid: "coded-uuid",
      searchScope: "registration",
      dataType: "Coded",
      widget: "Default",
      values: ["answer-b"],
    },
    {
      uuid: "text-uuid",
      searchScope: "registration",
      dataType: "Text",
      widget: "Default",
      value: "needs follow up",
    },
    {
      uuid: "datetime-uuid",
      minValue: "2026-02-05",
      maxValue: "2026-02-05",
      searchScope: "registration",
      dataType: "DateTime",
      widget: "Range",
    },
    {
      uuid: "date-uuid",
      minValue: "2026-01-15",
      maxValue: "2026-03-01",
      searchScope: "registration",
      dataType: "Date",
      widget: "Range",
    },
  ],
  gender: ["female-uuid"],
  registrationDate: { minValue: "2026-01-01", maxValue: "2026-01-31" },
  encounterDate: { minValue: null, maxValue: null },
  programEncounterDate: { minValue: null, maxValue: null },
  programEnrolmentDate: { minValue: null, maxValue: null },
  searchAll: "",
  programs: [],
  notEnrolledInAnyProgram: false,
  includeExitedEnrolments: false,
};

let container;
let root;
let onSearch;

const renderForm = async (searchRequest, configs = organisationConfigs) => {
  onSearch = jest.fn();
  await act(async () =>
    root.render(
      <MemoryRouter>
        <SearchForm
          operationalModules={{
            subjectTypes: [{ uuid: "st-person", name: "Individual" }],
          }}
          genders={[
            { uuid: "female-uuid", name: "Female" },
            { uuid: "male-uuid", name: "Male" },
          ]}
          organisationConfigs={configs}
          searchRequest={searchRequest}
          onSearch={onSearch}
        />
      </MemoryRouter>,
    ),
  );
};

const checkbox = (name) =>
  container.querySelector(`input[type='checkbox'][name='${name}']`);
const inputValues = () =>
  [...container.querySelectorAll("input")].map((input) => input.value);
const clickSearch = async () => {
  const button = [...container.querySelectorAll("button")].find(
    (b) => b.textContent === "search",
  );
  await act(async () => button.click());
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

describe("SearchForm restored from a saved search", () => {
  beforeEach(() => renderForm(savedSearch));

  it("shows the saved name, gender, address and coded answer", () => {
    expect(inputValues()).toContain("Asha");
    expect(checkbox("female-uuid").checked).toBe(true);
    expect(checkbox("male-uuid").checked).toBe(false);
    expect(container.querySelector("[data-testid='address']").textContent).toBe(
      "11,12",
    );
    expect(checkbox("answer-b").checked).toBe(true);
    expect(checkbox("answer-a").checked).toBe(false);
  });

  it("shows the saved text concept and every saved date on the user's own day", () => {
    const values = inputValues();
    expect(values).toContain("needs follow up");
    [
      "10/04/1990",
      "01/01/2026",
      "31/01/2026",
      "15/01/2026",
      "01/03/2026",
    ].forEach((date) => expect(values.join(" ")).toContain(date));
  });

  it("sends the same search again when Search is clicked", async () => {
    await clickSearch();

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch.mock.calls[0][0]).toEqual(savedSearch);
  });
});

describe("SearchForm date-time filter", () => {
  it("asks for a date only", async () => {
    await renderForm(savedSearch);

    const values = inputValues();
    expect(values.filter((v) => v === "05/02/2026")).toHaveLength(2);
    expect(values.some((v) => /\d{2}:\d{2}/.test(v))).toBe(false);
  });

  it("restores a date-time saved with a time as the user's own day and sends it as a date", async () => {
    const savedWithTime = {
      ...savedSearch,
      concept: savedSearch.concept.map((c) =>
        c.uuid === "datetime-uuid"
          ? {
              ...c,
              minValue: new Date(2026, 1, 5, 0, 30).toISOString(),
              maxValue: new Date(2026, 1, 5, 23, 15).toISOString(),
            }
          : c,
      ),
    };
    await renderForm(savedWithTime);
    await clickSearch();

    const sent = onSearch.mock.calls[0][0].concept.find(
      (c) => c.uuid === "datetime-uuid",
    );
    expect([sent.minValue, sent.maxValue]).toEqual(["2026-02-05", "2026-02-05"]);
  });
});

describe("SearchForm with a saved concept whose filter was reconfigured", () => {
  it("searches with the configured widget and scope, not the saved ones", async () => {
    await renderForm({
      ...savedSearch,
      concept: savedSearch.concept.map((c) =>
        c.uuid === "text-uuid"
          ? { ...c, widget: "Range", searchScope: "enrolment" }
          : c,
      ),
    });
    await clickSearch();

    const sent = onSearch.mock.calls[0][0].concept.find(
      (c) => c.uuid === "text-uuid",
    );
    expect(sent).toMatchObject({
      widget: "Default",
      searchScope: "registration",
      value: "needs follow up",
    });
  });
});

describe("SearchForm with one concept set up as two filters with different scopes", () => {
  const twoScopes = {
    organisationConfig: {
      searchFilters: [
        filter("Concept", {
          titleKey: "Remarks at registration",
          conceptUUID: "text-uuid",
          conceptDataType: "Text",
          scope: "registration",
        }),
        filter("Concept", {
          titleKey: "Remarks at enrolment",
          conceptUUID: "text-uuid",
          conceptDataType: "Text",
          scope: "programEnrolment",
        }),
      ],
    },
    conceptList: [],
  };
  const textBox = (titleKey) => container.querySelector(`input[id='${titleKey}']`);
  const typeInto = async (input, value) => {
    const setValue = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;
    await act(async () => {
      setValue.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };
  const emptySearch = { subjectType: "st-person", includeVoided: false };

  it("fills only the box typed into, and searches each with its own scope", async () => {
    await renderForm(emptySearch, twoScopes);
    await typeInto(textBox("Remarks at enrolment"), "follow up");

    expect(textBox("Remarks at registration").value).toBe("");
    expect(textBox("Remarks at enrolment").value).toBe("follow up");

    await typeInto(textBox("Remarks at registration"), "new");
    await clickSearch();

    expect(
      onSearch.mock.calls[0][0].concept.map(({ searchScope, value }) => [
        searchScope,
        value,
      ]),
    ).toEqual([
      ["registration", "new"],
      ["programEnrolment", "follow up"],
    ]);
  });

  it("restores each box from its own saved value", async () => {
    await renderForm(
      {
        ...emptySearch,
        concept: [
          { uuid: "text-uuid", searchScope: "programEnrolment", dataType: "Text", widget: "Default", value: "enrolled" },
          { uuid: "text-uuid", searchScope: "registration", dataType: "Text", widget: "Default", value: "registered" },
        ],
      },
      twoScopes,
    );

    expect(textBox("Remarks at registration").value).toBe("registered");
    expect(textBox("Remarks at enrolment").value).toBe("enrolled");
  });
});

describe("SearchForm with no saved search", () => {
  it("starts empty", async () => {
    await renderForm({ includeVoided: false, includeDisplayCount: false });

    expect(checkbox("female-uuid").checked).toBe(false);
    expect(checkbox("answer-b").checked).toBe(false);
    expect(inputValues()).not.toContain("Asha");
  });
});
