import { assert } from "chai";
import OperationalModulesFactory from "../../modelTest/OperationalModulesFactory";
import SubjectTypeFactory from "../../modelTest/SubjectTypeFactory";
import DashboardService from "./DashboardService";

it("should map server dashboard response", function() {
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
        voided: false
      }
    ],
    voided: false
  };

  const operationalModules = OperationalModulesFactory.create({
    subjectTypes: [SubjectTypeFactory.create({ uuid: "ST1" })]
  });
  const dashboard = DashboardService.mapDashboardFromResource(
    dashboardResponse,
    operationalModules
  );
  const filterConfig = dashboard.filters[0].filterConfig;
  assert.equal(filterConfig.subjectType.uuid, "ST1");
  assert.equal(filterConfig.type, "Gender");
});
