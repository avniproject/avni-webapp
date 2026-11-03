import { act } from "react";
import { createRoot } from "react-dom/client";
import fs from "fs";
import path from "path";
import {
  CustomFilter,
  DashboardFilterConfig,
  GroupSubjectTypeFilter,
  ObservationBasedFilter,
} from "openchs-models";
import ConceptService from "../../common/service/ConceptService";
import { CreateEditFiltersV2 } from "./CreateEditFiltersV2";
import DashboardService from "../../common/service/DashboardService";
import OperationalModulesFactory from "../../modelTest/OperationalModulesFactory";
import SubjectTypeFactory from "../../modelTest/SubjectTypeFactory";
import ProgramFactory from "../../modelTest/ProgramFactory";

// The real ToolTip imports react-markdown and fetches its text on mount. Stubbed with a marker
// carrying the key it was asked for, so a test can check which help text a field's help button opens.
jest.mock("../../common/components/ToolTip", () => ({
  ToolTip: ({ toolTipKey }) =>
    require("react").createElement("span", { "data-tooltip-key": toolTipKey }),
}));
// The real DocumentationContainer renders PlatformDocumentation, which calls fetch(...).then on mount.
jest.mock("../../common/components/DocumentationContainer", () => ({
  DocumentationContainer: ({ children }) => children,
}));
jest.mock("react-admin", () => ({ Title: () => null }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const NOT_AVAILABLE_SUBJECT_TYPE =
  "The preset subject type saved on this filter is no longer available. Saving clears it.";
const NOT_AVAILABLE_PROGRAM =
  "The preset program saved on this filter is no longer available for this subject type. Saving clears it.";

const enrolment = (subjectTypeUUID, programUUID) => ({
  subjectTypeUUID,
  programUUID,
  formType: "ProgramEnrolment",
});
const groupSubjectType = (uuid, name) => {
  const subjectType = SubjectTypeFactory.create({ uuid, name });
  subjectType.group = true;
  return subjectType;
};
const programEncounter = (programUUID, encounterTypeUUID) => ({
  programUUID,
  encounterTypeUUID,
  formType: "ProgramEncounter",
});
const operationalModules = OperationalModulesFactory.create({
  subjectTypes: [
    SubjectTypeFactory.create({ uuid: "ST1", name: "Patient" }),
    SubjectTypeFactory.create({ uuid: "ST2", name: "Household" }),
    SubjectTypeFactory.create({ uuid: "ST3", name: "Child" }),
    groupSubjectType("GS1", "Family"),
    groupSubjectType("GS2", "Team"),
  ],
  programs: [
    ProgramFactory.create({ uuid: "P1", name: "Screening" }),
    ProgramFactory.create({ uuid: "P2", name: "Treatment" }),
    ProgramFactory.create({ uuid: "P3", name: "Survey" }),
  ],
  formMappings: [
    enrolment("ST1", "P1"),
    enrolment("ST1", "P2"),
    enrolment("ST2", "P3"),
    enrolment("ST3", "P1"),
    programEncounter("P1", "E1"),
    programEncounter("P1", "E2"),
    programEncounter("P2", "E2"),
  ],
});
operationalModules.encounterTypes = [
  { uuid: "E1", name: "Visit" },
  { uuid: "E2", name: "Follow up" },
];

// As the server answers for a dashboard, mapped the way the dashboard page maps it on open.
const savedFilter = (filterConfig) =>
  DashboardService.mapDashboardFromResource(
    {
      uuid: "D1",
      name: "Dash",
      sections: [],
      filters: [
        { uuid: "F1", name: "Saved name", filterConfig, voided: false },
      ],
    },
    operationalModules,
  ).filters[0];

const subjectTypeFilter = (presetSubjectTypeUUID, presetProgramUUID) =>
  savedFilter({
    type: "SubjectType",
    presetSubjectTypeUUID,
    presetProgramUUID,
  });

const filterOfType = (type) => {
  const filterConfig = new DashboardFilterConfig();
  filterConfig.setType(type);
  return { uuid: "F1", name: "Some filter", filterConfig };
};

let container;
let root;
let dashboardFilterSave;
let opened = 0;

// A new key each time, so opening another filter starts the editor afresh as the dashboard page does.
const openEditor = async (selectedFilter) => {
  dashboardFilterSave = jest.fn();
  await act(async () => {
    root.render(
      <CreateEditFiltersV2
        key={++opened}
        selectedFilter={selectedFilter}
        operationalModules={operationalModules}
        documentationFileName="x.md"
        dashboardFilterSave={dashboardFilterSave}
      />,
    );
  });
};

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const input = (id) => document.getElementById(id);
const hasPicker = (id) => input(id) !== null;
const label = (id) => document.querySelector(`label[for="${id}"]`);
// The picker's own box: label row, react-select and any note under it.
const box = (id) => label(id).closest('div[style*="width: 400px"]');

// A react-select input holds only typed search text and a hidden live region repeats option names,
// so what a picker shows is read from its single value element.
const shown = (id) => {
  const value = box(id).querySelector('[class*="singleValue"]');
  return value ? value.textContent : "";
};

const pressKey = (field, key) =>
  field.dispatchEvent(
    new window.KeyboardEvent("keydown", { key, bubbles: true }),
  );
const openList = (id) =>
  act(async () => {
    input(id).focus();
    pressKey(input(id), "ArrowDown");
  });
const listedOptions = () =>
  [...document.querySelectorAll('[role="option"]')].map(
    (option) => option.textContent,
  );
const optionsOf = async (id) => {
  await openList(id);
  const texts = listedOptions();
  await act(async () => pressKey(input(id), "Escape"));
  return texts;
};
const choose = async (id, text) => {
  await openList(id);
  const option = [...document.querySelectorAll('[role="option"]')].find(
    (element) => element.textContent === text,
  );
  if (!option) throw new Error(`No option ${text} in ${id}`);
  await act(async () => option.click());
};
// Backspace on an empty input removes the value. A click on the clear indicator does nothing.
const clear = (id) =>
  act(async () => {
    input(id).focus();
    pressKey(input(id), "Backspace");
  });

const typeInto = (field, value) =>
  act(async () => {
    Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(field),
      "value",
    ).set.call(field, value);
    field.dispatchEvent(new window.Event("input", { bubbles: true }));
  });

const saveButton = () =>
  [...container.querySelectorAll("button")].find(
    (button) => button.textContent.trim().toLowerCase() === "save",
  );
const save = () => act(async () => saveButton().click());
const saved = () => dashboardFilterSave.mock.calls[0][0];

const helpKey = (id) =>
  label(id)
    .parentElement.parentElement.querySelector("[data-tooltip-key]")
    .getAttribute("data-tooltip-key");

const noteTexts = (id) => box(id).textContent;

describe("Subject Type filter preset pickers", () => {
  it("shows Preset subject type, and no Preset program until one is chosen, on a Subject Type filter", async () => {
    await openEditor(subjectTypeFilter());

    expect(hasPicker("presetSubjectType")).toBe(true);
    expect(label("presetSubjectType").textContent.trim()).toBe(
      "Preset subject type",
    );
    expect(hasPicker("presetProgram")).toBe(false);

    await choose("presetSubjectType", "Patient");

    expect(hasPicker("presetProgram")).toBe(true);
  });

  it("shows Preset program once a preset subject type is chosen, and both can be cleared", async () => {
    await openEditor(subjectTypeFilter("ST1", "P1"));

    expect(label("presetProgram").textContent.trim()).toBe("Preset program");
    expect(shown("presetSubjectType")).toBe("Patient");
    expect(shown("presetProgram")).toBe("Screening");

    await clear("presetProgram");
    expect(shown("presetProgram")).toBe("");

    await clear("presetSubjectType");
    expect(shown("presetSubjectType")).toBe("");
    expect(hasPicker("presetProgram")).toBe(false);
  });

  it("lists only programs enrolled into from the chosen subject type", async () => {
    await openEditor(subjectTypeFilter());

    await choose("presetSubjectType", "Patient");
    expect(await optionsOf("presetProgram")).toEqual([
      "Screening",
      "Treatment",
    ]);

    await choose("presetSubjectType", "Household");
    expect(await optionsOf("presetProgram")).toEqual(["Survey"]);
  });

  it("clears a preset program that does not fit the new subject type, and keeps one that does", async () => {
    await openEditor(subjectTypeFilter("ST1", "P1"));

    await choose("presetSubjectType", "Household");
    expect(shown("presetProgram")).toBe("");
    await save();
    expect(saved().filterConfig.presetProgram).toBeUndefined();
    expect(saved().filterConfig.presetSubjectType.uuid).toBe("ST2");

    await openEditor(subjectTypeFilter("ST1", "P1"));
    await choose("presetSubjectType", "Child");
    expect(shown("presetProgram")).toBe("Screening");
    await save();
    expect(saved().filterConfig.presetProgram.uuid).toBe("P1");
    expect(saved().filterConfig.presetSubjectType.uuid).toBe("ST3");
  });

  it("clears the preset program when the preset subject type is cleared", async () => {
    await openEditor(subjectTypeFilter("ST1", "P1"));

    await clear("presetSubjectType");
    await save();

    expect(saved().filterConfig.presetSubjectType).toBeUndefined();
    expect(saved().filterConfig.presetProgram).toBeUndefined();
  });

  it("shows no preset pickers on other filter types", async () => {
    const others = Object.values(CustomFilter.getDashboardFilterTypes()).filter(
      (type) => type !== CustomFilter.type.SubjectType,
    );
    expect(others.length).toBeGreaterThan(0);
    for (const type of others) {
      await openEditor(filterOfType(type));
      expect([type, hasPicker("presetSubjectType")]).toEqual([type, false]);
      expect([type, hasPicker("presetProgram")]).toEqual([type, false]);
    }
  });

  it("drops the presets when the filter type changes away from Subject Type", async () => {
    await openEditor(subjectTypeFilter("ST1", "P1"));

    await choose("filterType", "Gender");
    expect(hasPicker("presetSubjectType")).toBe(false);
    await save();
    expect(saved().filterConfig.presetSubjectType).toBeUndefined();
    expect(saved().filterConfig.presetProgram).toBeUndefined();

    await choose("filterType", "Subject Type");
    expect(shown("presetSubjectType")).toBe("");
  });

  it("drops the presets only when the type changes away from Subject Type", async () => {
    await openEditor(subjectTypeFilter("ST1", "P1"));

    await choose("filterType", "Subject Type");

    expect(shown("presetSubjectType")).toBe("Patient");
    expect(shown("presetProgram")).toBe("Screening");
  });

  it("saves the filter with the name the implementer gave it and the chosen presets", async () => {
    await openEditor(null);
    await choose("filterType", "Subject Type");
    await typeInto(input("filterName"), "Screening type");
    await choose("presetSubjectType", "Patient");
    await choose("presetProgram", "Screening");

    await save();

    expect(dashboardFilterSave).toHaveBeenCalledTimes(1);
    expect(saved().name).toBe("Screening type");
    const request = saved().filterConfig.toServerRequest();
    expect(request.presetSubjectTypeUUID).toBe("ST1");
    expect(request.presetProgramUUID).toBe("P1");
  });

  it("opens a saved filter with its presets shown", async () => {
    await openEditor(subjectTypeFilter("ST1", "P1"));

    expect(shown("presetSubjectType")).toBe("Patient");
    expect(shown("presetProgram")).toBe("Screening");
    expect(noteTexts("presetSubjectType")).not.toContain("no longer available");
    expect(noteTexts("presetProgram")).not.toContain("no longer available");
  });

  it("notes a preset subject type that is no longer available, and saving clears it", async () => {
    await openEditor(subjectTypeFilter("GONE", "P1"));

    expect(shown("presetSubjectType")).toBe("");
    expect(noteTexts("presetSubjectType")).toContain(
      NOT_AVAILABLE_SUBJECT_TYPE,
    );
    expect(document.body.textContent).not.toContain(NOT_AVAILABLE_PROGRAM);

    await save();

    const request = saved().filterConfig.toServerRequest();
    expect(request.presetSubjectTypeUUID ?? null).toBeNull();
    expect(request.presetProgramUUID ?? null).toBeNull();
  });

  it("notes a preset program that is no longer available for the subject type, and saving clears it", async () => {
    await openEditor(subjectTypeFilter("ST1", "P3"));

    expect(shown("presetSubjectType")).toBe("Patient");
    expect(shown("presetProgram")).toBe("");
    expect(noteTexts("presetProgram")).toContain(NOT_AVAILABLE_PROGRAM);
    expect(document.body.textContent).not.toContain(NOT_AVAILABLE_SUBJECT_TYPE);

    // The note describes the saved pair, so it goes once the subject type is not the saved one.
    await choose("presetSubjectType", "Household");
    expect(document.body.textContent).not.toContain(NOT_AVAILABLE_PROGRAM);

    await choose("presetSubjectType", "Patient");
    expect(noteTexts("presetProgram")).toContain(NOT_AVAILABLE_PROGRAM);
    await choose("presetProgram", "Treatment");
    expect(document.body.textContent).not.toContain(NOT_AVAILABLE_PROGRAM);
  });

  it("saving a filter whose preset program is no longer available clears it", async () => {
    await openEditor(subjectTypeFilter("ST1", "P3"));

    await save();

    const request = saved().filterConfig.toServerRequest();
    expect(request.presetSubjectTypeUUID).toBe("ST1");
    expect(request.presetProgramUUID ?? null).toBeNull();
  });

  it("leaves the dashboard's filter as it was when the editor closes without saving", async () => {
    const selectedFilter = subjectTypeFilter("ST1", "P1");
    await openEditor(selectedFilter);

    await choose("presetSubjectType", "Household");
    await typeInto(input("filterName"), "Renamed");
    await choose("filterType", "Gender");

    expect(dashboardFilterSave).not.toHaveBeenCalled();
    expect(selectedFilter.name).toBe("Saved name");
    expect(selectedFilter.filterConfig.type).toBe("SubjectType");
    expect(selectedFilter.filterConfig.presetSubjectType.uuid).toBe("ST1");
    expect(selectedFilter.filterConfig.presetProgram.uuid).toBe("P1");
  });

  // The nested settings of these types are objects the editor's handlers change in place.
  const pickerInput = (text) =>
    [...document.querySelectorAll("label")]
      .find((element) => element.textContent.trim() === text)
      .closest('div[style*="width: 400px"]')
      .querySelector("input:not([type=hidden])");
  const chooseIn = async (text, option) => {
    const field = pickerInput(text);
    await act(async () => {
      field.focus();
      pressKey(field, "ArrowDown");
    });
    const element = [...document.querySelectorAll('[role="option"]')].find(
      (x) => x.textContent === option,
    );
    if (!element) throw new Error(`No option ${option} in ${text}`);
    await act(async () => element.click());
  };

  it("leaves a Concept or Group Subject filter's settings as they were when the editor closes without saving", async () => {
    const original = { uuid: "C1", name: "Weight", datatype: "Numeric" };
    const replacement = { uuid: "C2", name: "Height", datatype: "Numeric" };
    const [P1] = operationalModules.programs;
    const [E1] = operationalModules.encounterTypes;

    const concept = new DashboardFilterConfig();
    concept.setType(CustomFilter.type.Concept);
    const observationBasedFilter = concept.observationBasedFilter;
    expect(observationBasedFilter).toBeInstanceOf(ObservationBasedFilter);
    observationBasedFilter.scope = CustomFilter.scope.ProgramEncounter;
    observationBasedFilter.concept = original;
    observationBasedFilter.programs = [P1];
    observationBasedFilter.encounterTypes = [E1];
    const programsBefore = observationBasedFilter.programs;
    const encounterTypesBefore = observationBasedFilter.encounterTypes;

    jest
      .spyOn(ConceptService, "searchDashboardFilterConcepts")
      .mockResolvedValue([replacement]);
    await openEditor({
      uuid: "F1",
      name: "Concept filter",
      filterConfig: concept,
    });
    await typeInto(pickerInput("Select Concept"), "Hei");
    await chooseIn("Select Concept", "Height");
    await chooseIn("Programs", "Treatment");
    await chooseIn("Encounter Types", "Follow up");
    await chooseIn("Scope", "Encounter");

    expect(dashboardFilterSave).not.toHaveBeenCalled();
    expect(concept.observationBasedFilter).toBe(observationBasedFilter);
    expect(observationBasedFilter.concept).toBe(original);
    expect(observationBasedFilter.scope).toBe(
      CustomFilter.scope.ProgramEncounter,
    );
    expect(observationBasedFilter.programs).toBe(programsBefore);
    expect(observationBasedFilter.programs).toEqual([P1]);
    expect(observationBasedFilter.encounterTypes).toBe(encounterTypesBefore);
    expect(observationBasedFilter.encounterTypes).toEqual([E1]);

    const group = new DashboardFilterConfig();
    group.setType(CustomFilter.type.GroupSubject);
    const groupSubjectTypeFilter = group.groupSubjectTypeFilter;
    expect(groupSubjectTypeFilter).toBeInstanceOf(GroupSubjectTypeFilter);
    const family = operationalModules.subjectTypes.find(
      (x) => x.uuid === "GS1",
    );
    groupSubjectTypeFilter.subjectType = family;
    group.subjectType = operationalModules.subjectTypes[0];

    await openEditor({ uuid: "F2", name: "Group filter", filterConfig: group });
    await chooseIn("Group Subject Type", "Team");

    expect(dashboardFilterSave).not.toHaveBeenCalled();
    expect(group.groupSubjectTypeFilter).toBe(groupSubjectTypeFilter);
    expect(groupSubjectTypeFilter.subjectType).toBe(family);
  });

  it("leaves the filter's own subject type setting unset", async () => {
    await openEditor(subjectTypeFilter());
    await choose("presetSubjectType", "Patient");
    await choose("presetProgram", "Screening");

    await save();

    expect(saved().filterConfig.subjectType).toBeFalsy();
    expect(saved().filterConfig.toServerRequest().subjectTypeUUID).toBeFalsy();
  });

  it("gives each preset picker its help text", async () => {
    await openEditor(subjectTypeFilter("ST1", "P1"));

    expect(helpKey("presetSubjectType")).toBe(
      "APP_DESIGNER_FILTER_PRESET_SUBJECT_TYPE",
    );
    expect(helpKey("presetProgram")).toBe("APP_DESIGNER_FILTER_PRESET_PROGRAM");

    const toolTips = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../../../public/documentation/toolTip.json"),
        "utf8",
      ),
    );
    expect(toolTips.APP_DESIGNER_FILTER_PRESET_SUBJECT_TYPE).toBe(
      "Optional. The subject type this filter starts with, so users don't have to choose it.",
    );
    expect(toolTips.APP_DESIGNER_FILTER_PRESET_PROGRAM).toBe(
      "Optional. The program, within the preset subject type, that this filter starts with.",
    );
  });
});
