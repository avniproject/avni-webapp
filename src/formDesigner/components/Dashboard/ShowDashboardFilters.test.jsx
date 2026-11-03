import { act } from "react";
import { createRoot } from "react-dom/client";
import { CustomFilter, DashboardFilterConfig } from "openchs-models";
import ShowDashboardFilters from "./ShowDashboardFilters";
import OperationalModulesFactory from "../../../modelTest/OperationalModulesFactory";
import SubjectTypeFactory from "../../../modelTest/SubjectTypeFactory";
import ProgramFactory from "../../../modelTest/ProgramFactory";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const patient = SubjectTypeFactory.create({ uuid: "ST1", name: "Patient" });
const household = SubjectTypeFactory.create({
  uuid: "ST2",
  name: "Household",
});
const screening = ProgramFactory.create({ uuid: "P1", name: "Screening" });
const operationalModules = OperationalModulesFactory.create({
  subjectTypes: [patient, household],
  programs: [screening],
});

const filterOf = (type, name, setUp = () => {}, extra = {}) => {
  const filterConfig = new DashboardFilterConfig();
  filterConfig.setType(type);
  setUp(filterConfig);
  return { uuid: name, name, filterConfig, ...extra };
};

let container;
let root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

// The Subject Type cell of the row for the named filter.
const subjectTypeCell = (name) => {
  const row = [...container.querySelectorAll("tbody tr")].find(
    (tr) => tr.querySelector("td")?.textContent.trim() === name,
  );
  if (!row) throw new Error(`No row for ${name}`);
  return row.querySelectorAll("td")[1].textContent.trim();
};

const show = (filters) =>
  act(async () => {
    root.render(
      <ShowDashboardFilters
        filters={filters}
        operationalModules={operationalModules}
      />,
    );
  });

describe("Subject Type column of the dashboard's filters", () => {
  it("shows a preset subject type, with its program when there is one", async () => {
    await show([
      filterOf(CustomFilter.type.SubjectType, "Subject only", (config) => {
        config.presetSubjectType = patient;
      }),
      filterOf(
        CustomFilter.type.SubjectType,
        "Subject and program",
        (config) => {
          config.presetSubjectType = patient;
          config.presetProgram = screening;
        },
      ),
    ]);

    expect(subjectTypeCell("Subject only")).toBe("Preset: Patient");
    expect(subjectTypeCell("Subject and program")).toBe(
      "Preset: Patient, Screening",
    );
  });

  it("says a saved preset is no longer available", async () => {
    await show([
      filterOf(CustomFilter.type.SubjectType, "Dropped", () => {}, {
        unavailablePreset: { subjectType: true, program: true },
      }),
    ]);

    expect(subjectTypeCell("Dropped")).toBe("Preset no longer available");
  });

  it("shows nothing for a Subject Type filter with no preset", async () => {
    await show([filterOf(CustomFilter.type.SubjectType, "Plain")]);

    expect(subjectTypeCell("Plain")).toBe("");
  });

  it("still shows the subject type of other filter types", async () => {
    await show([
      filterOf(CustomFilter.type.Gender, "Gender filter", (config) => {
        config.subjectType = household;
      }),
    ]);

    expect(subjectTypeCell("Gender filter")).toBe("Household");
  });
});
