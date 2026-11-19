import { isSameFilter, withoutFilter } from "./customFilterIdentity";

const participantProgramme = { titleKey: "Programme", subjectTypeUUID: "participant", type: "Program" };
const cohortProgramme = { titleKey: "Programme", subjectTypeUUID: "cohort", type: "Program" };
const participantName = { titleKey: "Name", subjectTypeUUID: "participant", type: "Name" };

describe("custom filter identity", () => {
  it("removes only the filter of the same subject type when another subject type has a filter with the same title", () => {
    const filters = [participantProgramme, cohortProgramme, participantName];
    expect(withoutFilter(filters, cohortProgramme)).toEqual([participantProgramme, participantName]);
  });

  it("matches the table row of a filter, which carries extra table data", () => {
    expect(isSameFilter(participantProgramme, { ...participantProgramme, tableData: { id: 0 } })).toBe(true);
  });

  it("treats filters without a subject type, as on My Dashboard, as known by title alone", () => {
    const dashboardFilters = [{ titleKey: "Date" }, { titleKey: "Address", subjectTypeUUID: "" }];
    expect(withoutFilter(dashboardFilters, { titleKey: "Address" })).toEqual([{ titleKey: "Date" }]);
  });

  it("keeps every filter when nothing is being replaced", () => {
    expect(withoutFilter([participantProgramme], undefined)).toEqual([participantProgramme]);
  });
});
