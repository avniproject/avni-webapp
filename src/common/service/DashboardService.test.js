import { assert } from "chai";
import OperationalModulesFactory from "../../modelTest/OperationalModulesFactory";
import SubjectTypeFactory from "../../modelTest/SubjectTypeFactory";
import ProgramFactory from "../../modelTest/ProgramFactory";
import DashboardService from "./DashboardService";

it("should map server dashboard response", function () {
  const dashboardResponse = {
    uuid: "8fd1e6c2-6e11-4332-b5db-1f089896dee5",
    id: 3,
    name: "Pregnancy",
    description: "",
    sections: [],
    filters: [
      {
        uuid: "72b3e5d1-ce17-4de4-a53d-b93481f2ce75",
        id: 7,
        name: "a",
        filterConfig: { subjectTypeUUID: "ST1", type: "Gender" },
        voided: false,
      },
    ],
    voided: false,
  };

  const operationalModules = OperationalModulesFactory.create({
    subjectTypes: [SubjectTypeFactory.create({ uuid: "ST1" })],
  });
  const dashboard = DashboardService.mapDashboardFromResource(dashboardResponse, operationalModules);
  const filterConfig = dashboard.filters[0].filterConfig;
  assert.equal(filterConfig.subjectType.uuid, "ST1");
  assert.equal(filterConfig.type, "Gender");
});

describe("Subject Type filter preset", function () {
  const enrolment = (subjectTypeUUID, programUUID) => ({ subjectTypeUUID, programUUID, formType: "ProgramEnrolment" });
  const operationalModules = OperationalModulesFactory.create({
    subjectTypes: [
      SubjectTypeFactory.create({ uuid: "ST1", name: "Patient" }),
      SubjectTypeFactory.create({ uuid: "ST2", name: "Household" }),
    ],
    programs: [
      ProgramFactory.create({ uuid: "P1", name: "Screening" }),
      ProgramFactory.create({ uuid: "P2", name: "Treatment" }),
      ProgramFactory.create({ uuid: "P3", name: "Survey" }),
    ],
    formMappings: [enrolment("ST1", "P1"), enrolment("ST1", "P2"), enrolment("ST2", "P3")],
  });

  const mapFilter = (filterConfig) => {
    const response = {
      uuid: "D1",
      name: "Dash",
      sections: [],
      filters: [{ uuid: "F1", name: "f", filterConfig, voided: false }],
    };
    return DashboardService.mapDashboardFromResource(response, operationalModules).filters[0];
  };

  it("reads a Subject Type filter's preset subject type and program", function () {
    const filter = mapFilter({ type: "SubjectType", presetSubjectTypeUUID: "ST1", presetProgramUUID: "P1" });
    assert.equal(filter.filterConfig.presetSubjectType.uuid, "ST1");
    assert.equal(filter.filterConfig.presetProgram.uuid, "P1");
    assert.notProperty(filter, "unavailablePreset");
  });

  it("reads a preset subject type with no program", function () {
    const filter = mapFilter({ type: "SubjectType", presetSubjectTypeUUID: "ST1" });
    assert.equal(filter.filterConfig.presetSubjectType.name, "Patient");
    assert.isUndefined(filter.filterConfig.presetProgram);
    assert.notProperty(filter, "unavailablePreset");
  });

  it("opens a filter saved before the preset with no preset", function () {
    const filter = mapFilter({ type: "SubjectType" });
    assert.isUndefined(filter.filterConfig.presetSubjectType);
    assert.isUndefined(filter.filterConfig.presetProgram);
    assert.notProperty(filter, "unavailablePreset");
  });

  it("marks a preset subject type that is no longer available", function () {
    const filter = mapFilter({ type: "SubjectType", presetSubjectTypeUUID: "GONE", presetProgramUUID: "P1" });
    assert.isUndefined(filter.filterConfig.presetSubjectType);
    assert.isUndefined(filter.filterConfig.presetProgram);
    assert.deepEqual(filter.unavailablePreset, { subjectType: true, program: true });
  });

  it("marks a preset program that no longer exists", function () {
    const filter = mapFilter({ type: "SubjectType", presetSubjectTypeUUID: "ST1", presetProgramUUID: "P-GONE" });
    assert.equal(filter.filterConfig.presetSubjectType.uuid, "ST1");
    assert.isUndefined(filter.filterConfig.presetProgram);
    assert.deepEqual(filter.unavailablePreset, { subjectType: false, program: true });
  });

  it("marks a preset program no longer enrolled into from the subject type", function () {
    const filter = mapFilter({ type: "SubjectType", presetSubjectTypeUUID: "ST1", presetProgramUUID: "P3" });
    assert.equal(filter.filterConfig.presetSubjectType.uuid, "ST1");
    assert.isUndefined(filter.filterConfig.presetProgram);
    assert.deepEqual(filter.unavailablePreset, { subjectType: false, program: true });
  });

  it("reads no preset for other filter types", function () {
    const filter = mapFilter({ type: "Gender", presetSubjectTypeUUID: "ST1" });
    assert.isUndefined(filter.filterConfig.presetSubjectType);
    assert.isUndefined(filter.filterConfig.presetProgram);
    assert.notProperty(filter, "unavailablePreset");
  });
});
