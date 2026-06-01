import { Privilege } from "openchs-models";
import { generatePrivilegeDependenciesAndCheckedState } from "./GroupPrivileges";

const { PrivilegeType } = Privilege;

let uuidCounter = 0;
const nextUuid = () => `uuid-${++uuidCounter}`;

const privilege = (overrides = {}) => ({
  uuid: nextUuid(),
  privilegeTypeName: null,
  subjectTypeId: null,
  programId: null,
  encounterTypeId: null,
  programEncounterTypeId: null,
  checklistDetailId: null,
  memberSubjectIds: null,
  allow: true,
  ...overrides,
});

describe("generatePrivilegeDependenciesAndCheckedState", () => {
  beforeEach(() => {
    uuidCounter = 0;
  });

  it("makes AssignSubject depend on ViewSubject of the same subject type", () => {
    const viewSubject = privilege({
      privilegeTypeName: PrivilegeType.ViewSubject,
      subjectTypeId: 1,
    });
    const assignSubject = privilege({
      privilegeTypeName: PrivilegeType.AssignSubject,
      subjectTypeId: 1,
    });

    const [, dependencies] = generatePrivilegeDependenciesAndCheckedState([viewSubject, assignSubject]);

    expect(dependencies.get(assignSubject.uuid).dependencies).toEqual([viewSubject.uuid]);
    // ViewSubject OFF must cascade to AssignSubject
    expect(dependencies.get(viewSubject.uuid).dependents).toContain(assignSubject.uuid);
  });

  it("does not link AssignSubject to ViewSubject of a different subject type", () => {
    const viewSubjectOther = privilege({
      privilegeTypeName: PrivilegeType.ViewSubject,
      subjectTypeId: 2,
    });
    const assignSubject = privilege({
      privilegeTypeName: PrivilegeType.AssignSubject,
      subjectTypeId: 1,
    });

    const [, dependencies] = generatePrivilegeDependenciesAndCheckedState([viewSubjectOther, assignSubject]);

    expect(dependencies.get(assignSubject.uuid).dependencies).toEqual([]);
  });
});
