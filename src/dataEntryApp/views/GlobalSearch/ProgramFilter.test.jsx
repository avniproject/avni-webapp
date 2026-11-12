import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { SearchForm, programsOfSubjectType } from "./SearchFilterForm";

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

const enrolmentMapping = (subjectTypeUUID, programUUID) => ({
  formType: "ProgramEnrolment",
  subjectTypeUUID,
  programUUID,
});

const operationalModules = {
  subjectTypes: [
    { uuid: "st-person", name: "Person" },
    { uuid: "st-house", name: "Household" },
  ],
  programs: [
    { uuid: "p-child", operationalProgramName: "Child", name: "Child" },
    { uuid: "p-anc", operationalProgramName: "ANC", name: "ANC" },
    { uuid: "p-birth", operationalProgramName: "birth", name: "birth" },
    { uuid: "p-other", operationalProgramName: "Other", name: "Other" },
  ],
  formMappings: [
    enrolmentMapping("st-person", "p-child"),
    enrolmentMapping("st-person", "p-anc"),
    enrolmentMapping("st-person", "p-birth"),
    { ...enrolmentMapping("st-person", "p-child"), formType: "ProgramExit" },
    { formType: "IndividualProfile", subjectTypeUUID: "st-house" },
    {
      formType: "ProgramEncounter",
      subjectTypeUUID: "st-house",
      programUUID: "p-other",
    },
    enrolmentMapping("st-other", "p-other"),
  ],
};

const programFilter = (subjectTypeUUID) => ({
  type: "Program",
  titleKey: "Programme",
  subjectTypeUUID,
  widget: "Default",
});

const configsWith = (...searchFilters) => ({
  organisationConfig: { searchFilters },
  conceptList: [],
});

let container;
let root;
let onSearch;

const renderForm = async (organisationConfigs, searchRequest = {}) => {
  onSearch = jest.fn();
  await act(async () =>
    root.render(
      <MemoryRouter>
        <SearchForm
          operationalModules={operationalModules}
          genders={[]}
          organisationConfigs={organisationConfigs}
          searchRequest={{ subjectType: "st-person", ...searchRequest }}
          onSearch={onSearch}
        />
      </MemoryRouter>,
    ),
  );
};

const checkbox = (name) =>
  container.querySelector(`input[type='checkbox'][name='${name}']`);
const click = async (name) => act(async () => checkbox(name).click());
const greyedOut = (name) => {
  const box = checkbox(name);
  return !!box && box.disabled && !box.checked;
};
const boxOrder = () =>
  [...container.querySelectorAll("input[type='checkbox']")].map((c) => c.name);
const search = async () => {
  const button = [...container.querySelectorAll("button")].find(
    (b) => b.textContent === "search",
  );
  await act(async () => button.click());
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

describe("programsOfSubjectType", () => {
  it("lists programmes with an enrolment form for the subject type, by name", () => {
    expect(
      programsOfSubjectType(operationalModules, "st-person").map((p) => p.uuid),
    ).toEqual(["p-anc", "p-birth", "p-child"]);
    expect(programsOfSubjectType(operationalModules, "st-house")).toEqual([]);
    expect(programsOfSubjectType(undefined, "st-person")).toEqual([]);
  });
});

describe("Program search filter", () => {
  it("shows a tick box per programme and one for not enrolled", async () => {
    await renderForm(configsWith(programFilter("st-person")));

    expect(container.textContent).toContain("Programme");
    expect(checkbox("p-child")).not.toBeNull();
    expect(checkbox("p-anc")).not.toBeNull();
    expect(checkbox("p-other")).toBeNull();
    expect(checkbox("notEnrolledInAnyProgram")).not.toBeNull();
    expect(container.textContent).toContain("notEnrolledInAnyProgram");
  });

  it("sends nothing ticked as an ignored filter", async () => {
    await renderForm(configsWith(programFilter("st-person")));

    const request = await search();
    expect(request.programs).toEqual([]);
    expect(request.notEnrolledInAnyProgram).toBe(false);
  });

  it("sends not enrolled on its own", async () => {
    await renderForm(configsWith(programFilter("st-person")));
    await click("notEnrolledInAnyProgram");

    const request = await search();
    expect(request.programs).toEqual([]);
    expect(request.notEnrolledInAnyProgram).toBe(true);
  });

  it("sends ticked programmes together with not enrolled", async () => {
    await renderForm(configsWith(programFilter("st-person")));
    await click("p-child");
    await click("p-anc");
    await click("p-anc");
    await click("notEnrolledInAnyProgram");

    expect(checkbox("notEnrolledInAnyProgram").checked).toBe(true);
    const request = await search();
    expect(request.programs).toEqual(["p-child"]);
    expect(request.notEnrolledInAnyProgram).toBe(true);
    expect(request.includeExitedEnrolments).toBe(false);
  });

  it("keeps Not enrolled ticked when a programme is ticked after it", async () => {
    await renderForm(configsWith(programFilter("st-person")));
    await click("notEnrolledInAnyProgram");
    await click("p-child");

    expect(checkbox("notEnrolledInAnyProgram").checked).toBe(true);
    const request = await search();
    expect(request.programs).toEqual(["p-child"]);
    expect(request.notEnrolledInAnyProgram).toBe(true);
  });

  it("greys out Include exited while Not enrolled is ticked", async () => {
    await renderForm(configsWith(programFilter("st-person")));
    await click("notEnrolledInAnyProgram");

    expect(greyedOut("includeExitedEnrolments")).toBe(true);
    await click("notEnrolledInAnyProgram");
    expect(checkbox("includeExitedEnrolments").checked).toBe(false);
  });

  it("greys out Not enrolled while Include exited is ticked", async () => {
    await renderForm(configsWith(programFilter("st-person")));
    await click("includeExitedEnrolments");

    expect(greyedOut("notEnrolledInAnyProgram")).toBe(true);
    const request = await search();
    expect(request.notEnrolledInAnyProgram).toBe(false);
    expect(request.includeExitedEnrolments).toBe(true);

    await click("includeExitedEnrolments");
    expect(checkbox("notEnrolledInAnyProgram").checked).toBe(false);
  });

  it("leaves exited enrolments out unless Include exited is ticked", async () => {
    await renderForm(configsWith(programFilter("st-person")));
    expect(checkbox("includeExitedEnrolments").checked).toBe(false);
    await click("p-child");

    expect((await search()).includeExitedEnrolments).toBe(false);

    await click("includeExitedEnrolments");
    onSearch.mockClear();
    const request = await search();
    expect(request.programs).toEqual(["p-child"]);
    expect(request.includeExitedEnrolments).toBe(true);
  });

  it("sends Include exited on its own, with no programme ticked", async () => {
    await renderForm(configsWith(programFilter("st-person")));
    await click("includeExitedEnrolments");

    const request = await search();
    expect(request.programs).toEqual([]);
    expect(request.notEnrolledInAnyProgram).toBe(false);
    expect(request.includeExitedEnrolments).toBe(true);
  });

  it("keeps every box in place when Not enrolled or Include exited is ticked", async () => {
    await renderForm(configsWith(programFilter("st-person")));
    const order = boxOrder();

    await click("includeExitedEnrolments");
    expect(boxOrder()).toEqual(order);
    await click("includeExitedEnrolments");
    await click("notEnrolledInAnyProgram");
    expect(boxOrder()).toEqual(order);
  });

  it("ends unticked after a double or quadruple click on Include exited", async () => {
    await renderForm(configsWith(programFilter("st-person")));
    for (const times of [2, 4]) {
      for (let i = 0; i < times; i++) await click("includeExitedEnrolments");
      expect(checkbox("includeExitedEnrolments").checked).toBe(false);
      expect(checkbox("notEnrolledInAnyProgram").disabled).toBe(false);
    }
  });

  it("ignores a click on the greyed-out box", async () => {
    await renderForm(configsWith(programFilter("st-person")));
    await click("includeExitedEnrolments");
    await click("notEnrolledInAnyProgram");

    expect(checkbox("includeExitedEnrolments").checked).toBe(true);
    expect(greyedOut("notEnrolledInAnyProgram")).toBe(true);
    const request = await search();
    expect(request.includeExitedEnrolments).toBe(true);
    expect(request.notEnrolledInAnyProgram).toBe(false);
  });

  it("is hidden and not sent when the subject type has no programmes", async () => {
    await renderForm(configsWith(programFilter("st-house")), {
      subjectType: "st-house",
      programs: ["p-child"],
      notEnrolledInAnyProgram: true,
    });

    expect(checkbox("notEnrolledInAnyProgram")).toBeNull();
    expect(checkbox("includeExitedEnrolments")).toBeNull();
    const request = await search();
    expect(request.programs).toEqual([]);
    expect(request.notEnrolledInAnyProgram).toBe(false);
    expect(request.includeExitedEnrolments).toBe(false);
  });

  it("draws the tick boxes once when two Program filters were saved for the subject type", async () => {
    await renderForm(
      configsWith(programFilter("st-person"), {
        ...programFilter("st-person"),
        titleKey: "Programme again",
      }),
    );

    expect(
      container.querySelectorAll("input[type='checkbox'][name='p-child']"),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll(
        "input[type='checkbox'][name='notEnrolledInAnyProgram']",
      ),
    ).toHaveLength(1);
    expect(container.textContent).not.toContain("Programme again");
  });

  it("is hidden when no Program filter is configured", async () => {
    await renderForm(
      configsWith({ ...programFilter("st-person"), type: "Name" }),
    );

    expect(checkbox("notEnrolledInAnyProgram")).toBeNull();
    expect(checkbox("p-child")).toBeNull();
  });

  it("restores the saved ticks and drops programmes no longer offered", async () => {
    await renderForm(configsWith(programFilter("st-person")), {
      programs: ["p-anc", "p-gone"],
      notEnrolledInAnyProgram: false,
      includeExitedEnrolments: true,
    });

    expect(checkbox("p-anc").checked).toBe(true);
    expect(checkbox("p-child").checked).toBe(false);
    expect(greyedOut("notEnrolledInAnyProgram")).toBe(true);
    expect(checkbox("includeExitedEnrolments").checked).toBe(true);
    const request = await search();
    expect(request.programs).toEqual(["p-anc"]);
    expect(request.notEnrolledInAnyProgram).toBe(false);
    expect(request.includeExitedEnrolments).toBe(true);
  });

  it("restores Not enrolled with a programme and keeps Include exited greyed out", async () => {
    await renderForm(configsWith(programFilter("st-person")), {
      programs: ["p-anc", "p-gone"],
      notEnrolledInAnyProgram: true,
    });

    expect(checkbox("p-anc").checked).toBe(true);
    expect(checkbox("notEnrolledInAnyProgram").checked).toBe(true);
    expect(greyedOut("includeExitedEnrolments")).toBe(true);
    const request = await search();
    expect(request.programs).toEqual(["p-anc"]);
    expect(request.notEnrolledInAnyProgram).toBe(true);
  });

  it("never sends Not enrolled with Include exited from an older saved search", async () => {
    await renderForm(configsWith(programFilter("st-person")), {
      programs: ["p-anc"],
      notEnrolledInAnyProgram: true,
      includeExitedEnrolments: true,
    });

    expect(greyedOut("notEnrolledInAnyProgram")).toBe(true);
    const request = await search();
    expect(request.programs).toEqual(["p-anc"]);
    expect(request.notEnrolledInAnyProgram).toBe(false);
    expect(request.includeExitedEnrolments).toBe(true);
  });
});
