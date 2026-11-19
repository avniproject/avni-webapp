import { CustomFilter, DashboardFilterConfig } from "openchs-models";
import { DashboardReducer } from "./DashboardReducer";
import WebDashboard from "../../../common/model/reports/WebDashboard";
import SubjectTypeFactory from "../../../modelTest/SubjectTypeFactory";
import ProgramFactory from "../../../modelTest/ProgramFactory";

const patient = SubjectTypeFactory.create({ uuid: "ST1", name: "Patient" });
const screening = ProgramFactory.create({ uuid: "P1", name: "Screening" });

const presetFilter = (name, presetSubjectType, presetProgram) => {
  const filterConfig = new DashboardFilterConfig();
  filterConfig.setType(CustomFilter.type.SubjectType);
  filterConfig.presetSubjectType = presetSubjectType;
  filterConfig.presetProgram = presetProgram;
  return { name, filterConfig };
};

const dashboardWith = (filters) => ({
  uuid: "D1",
  id: 1,
  name: "Dash",
  description: "",
  sections: [],
  filters,
});

const sent = (dashboard) => WebDashboard.toResource(dashboard).filters;

describe("DashboardReducer filters and the Subject Type filter's preset", () => {
  it("editFilter keeps the filter's id and uuid and carries its presets into the saved dashboard", () => {
    const selectedFilter = {
      id: 7,
      uuid: "F1",
      name: "Old",
      voided: false,
      filterConfig: new DashboardFilterConfig(),
    };
    const dashboard = dashboardWith([selectedFilter]);
    const modifiedFilter = presetFilter("Patients", patient, screening);

    const result = DashboardReducer(dashboard, {
      type: "editFilter",
      payload: { dashboard, modifiedFilter, selectedFilter },
    });

    expect(result.filters).toHaveLength(1);
    expect(result.filters[0].id).toBe(7);
    expect(result.filters[0].uuid).toBe("F1");
    const [filter] = sent(result);
    expect(filter.uuid).toBe("F1");
    expect(filter.name).toBe("Patients");
    expect(filter.filterConfig.presetSubjectTypeUUID).toBe("ST1");
    expect(filter.filterConfig.presetProgramUUID).toBe("P1");
  });

  it("addFilter carries a new filter's presets into the saved dashboard", () => {
    const dashboard = dashboardWith([]);
    const modifiedFilter = presetFilter("Patients", patient, screening);

    const result = DashboardReducer(dashboard, {
      type: "addFilter",
      payload: { dashboard, modifiedFilter },
    });

    const [filter] = sent(result);
    expect(filter.uuid).toBeTruthy();
    expect(filter.name).toBe("Patients");
    expect(filter.filterConfig.presetSubjectTypeUUID).toBe("ST1");
    expect(filter.filterConfig.presetProgramUUID).toBe("P1");
  });

  it("sends no preset for the Subject Type filter added automatically", () => {
    const dashboard = dashboardWith([]);
    const gender = new DashboardFilterConfig();
    gender.setType(CustomFilter.type.Gender);
    gender.subjectType = patient;

    const result = DashboardReducer(dashboard, {
      type: "addFilter",
      payload: { dashboard, modifiedFilter: { name: "Gender", filterConfig: gender } },
    });

    const automatic = sent(result).find((filter) => filter.filterConfig.type === CustomFilter.type.SubjectType);
    expect(automatic).toBeDefined();
    expect(automatic.name).toBe("Subject Type");
    expect(automatic.filterConfig.presetSubjectTypeUUID ?? null).toBeNull();
    expect(automatic.filterConfig.presetProgramUUID ?? null).toBeNull();
  });
});
