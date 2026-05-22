import { Privilege } from "openchs-models";
import GroupPrivilegesModel from "./GroupPrivilegesModel";

const { PrivilegeType } = Privilege;

// minimal privilege factory — only the fields the model reads matter
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
  allow: false,
  ...overrides,
});

const uuids = (list) => list.map((p) => p.uuid).sort();

describe("GroupPrivilegesModel", () => {
  beforeEach(() => {
    uuidCounter = 0;
  });

  describe("getAddMemberDependencies", () => {
    it("returns ViewSubject for the group's own subject type", () => {
      const viewGroup = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 3,
      });
      const viewMember = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 2,
      });
      const addMember = privilege({
        privilegeTypeName: PrivilegeType.AddMember,
        subjectTypeId: 3,
        memberSubjectIds: [],
      });

      const deps = GroupPrivilegesModel.getAddMemberDependencies([viewGroup, viewMember, addMember], addMember);

      expect(uuids(deps)).toEqual([viewGroup.uuid]);
    });

    it("returns ViewSubject for every memberSubjectId plus the group's own", () => {
      const viewGroup = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 3,
      });
      const viewMemberA = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 2,
      });
      const viewMemberB = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 5,
      });
      const viewUnrelated = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 9,
      });
      const addMember = privilege({
        privilegeTypeName: PrivilegeType.AddMember,
        subjectTypeId: 3,
        memberSubjectIds: [2, 5],
      });

      const deps = GroupPrivilegesModel.getAddMemberDependencies(
        [viewGroup, viewMemberA, viewMemberB, viewUnrelated, addMember],
        addMember,
      );

      expect(uuids(deps)).toEqual(uuids([viewGroup, viewMemberA, viewMemberB]));
    });

    it("ignores non-ViewSubject privileges even when subjectTypeId matches", () => {
      const editMember = privilege({
        privilegeTypeName: PrivilegeType.EditSubject,
        subjectTypeId: 2,
      });
      const addMember = privilege({
        privilegeTypeName: PrivilegeType.AddMember,
        subjectTypeId: 3,
        memberSubjectIds: [2],
      });

      const deps = GroupPrivilegesModel.getAddMemberDependencies([editMember, addMember], addMember);

      expect(deps).toEqual([]);
    });

    it("handles missing memberSubjectIds (backend without the new field)", () => {
      const viewGroup = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 3,
      });
      const addMember = privilege({
        privilegeTypeName: PrivilegeType.AddMember,
        subjectTypeId: 3,
        memberSubjectIds: undefined,
      });

      const deps = GroupPrivilegesModel.getAddMemberDependencies([viewGroup, addMember], addMember);

      expect(uuids(deps)).toEqual([viewGroup.uuid]);
    });
  });

  describe("getViewVisitDependencies", () => {
    it("returns ViewSubject + ViewEnrolmentDetails for a program-encounter ViewVisit", () => {
      const viewSubject = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 1,
      });
      const viewEnrolment = privilege({
        privilegeTypeName: PrivilegeType.ViewEnrolmentDetails,
        subjectTypeId: 1,
        programId: 10,
      });
      const viewVisit = privilege({
        privilegeTypeName: PrivilegeType.ViewVisit,
        subjectTypeId: 1,
        programId: 10,
        programEncounterTypeId: 100,
      });

      const deps = GroupPrivilegesModel.getViewVisitDependencies([viewSubject, viewEnrolment, viewVisit], viewVisit);

      expect(uuids(deps)).toEqual(uuids([viewSubject, viewEnrolment]));
    });

    it("returns only ViewSubject for a general-encounter ViewVisit (no programId)", () => {
      const viewSubject = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 1,
      });
      const viewEnrolment = privilege({
        privilegeTypeName: PrivilegeType.ViewEnrolmentDetails,
        subjectTypeId: 1,
        programId: 10,
      });
      const viewVisit = privilege({
        privilegeTypeName: PrivilegeType.ViewVisit,
        subjectTypeId: 1,
        programId: null,
        encounterTypeId: 200,
      });

      const deps = GroupPrivilegesModel.getViewVisitDependencies([viewSubject, viewEnrolment, viewVisit], viewVisit);

      expect(uuids(deps)).toEqual([viewSubject.uuid]);
    });

    it("excludes ViewEnrolmentDetails for a different program", () => {
      const viewSubject = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 1,
      });
      const otherProgramEnrolment = privilege({
        privilegeTypeName: PrivilegeType.ViewEnrolmentDetails,
        subjectTypeId: 1,
        programId: 99,
      });
      const viewVisit = privilege({
        privilegeTypeName: PrivilegeType.ViewVisit,
        subjectTypeId: 1,
        programId: 10,
      });

      const deps = GroupPrivilegesModel.getViewVisitDependencies([viewSubject, otherProgramEnrolment, viewVisit], viewVisit);

      expect(uuids(deps)).toEqual([viewSubject.uuid]);
    });

    it("excludes ViewSubject for a different subject type", () => {
      const otherSubject = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 7,
      });
      const viewVisit = privilege({
        privilegeTypeName: PrivilegeType.ViewVisit,
        subjectTypeId: 1,
        programId: 10,
      });

      const deps = GroupPrivilegesModel.getViewVisitDependencies([otherSubject, viewVisit], viewVisit);

      expect(deps).toEqual([]);
    });
  });

  describe("getSubjectTypeDependencies", () => {
    it("returns ViewSubject privileges with matching subject type", () => {
      const matching = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 1,
      });
      const wrongType = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 2,
      });
      const wrongPrivilege = privilege({
        privilegeTypeName: PrivilegeType.EditSubject,
        subjectTypeId: 1,
      });
      const target = privilege({
        privilegeTypeName: PrivilegeType.RegisterSubject,
        subjectTypeId: 1,
      });

      const deps = GroupPrivilegesModel.getSubjectTypeDependencies([matching, wrongType, wrongPrivilege, target], target);

      expect(uuids(deps)).toEqual([matching.uuid]);
    });
  });

  describe("getProgramDependencies", () => {
    it("returns matching ViewEnrolmentDetails and ViewSubject", () => {
      const viewSubject = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 1,
      });
      const viewEnrolment = privilege({
        privilegeTypeName: PrivilegeType.ViewEnrolmentDetails,
        subjectTypeId: 1,
        programId: 10,
      });
      const enrolmentDifferentProgram = privilege({
        privilegeTypeName: PrivilegeType.ViewEnrolmentDetails,
        subjectTypeId: 1,
        programId: 11,
      });
      const target = privilege({
        privilegeTypeName: PrivilegeType.EnrolSubject,
        subjectTypeId: 1,
        programId: 10,
      });

      const deps = GroupPrivilegesModel.getProgramDependencies([viewSubject, viewEnrolment, enrolmentDifferentProgram, target], target);

      expect(uuids(deps)).toEqual(uuids([viewSubject, viewEnrolment]));
    });
  });

  describe("getEncounterTypeDependencies", () => {
    it("returns matching ViewVisit (by subjectType+program+encounterType+programEncounterType) and ViewSubject", () => {
      const viewSubject = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 1,
      });
      const viewVisit = privilege({
        privilegeTypeName: PrivilegeType.ViewVisit,
        subjectTypeId: 1,
        programId: 10,
        programEncounterTypeId: 100,
        encounterTypeId: null,
      });
      const otherProgEncounter = privilege({
        privilegeTypeName: PrivilegeType.ViewVisit,
        subjectTypeId: 1,
        programId: 10,
        programEncounterTypeId: 101,
      });
      const target = privilege({
        privilegeTypeName: PrivilegeType.PerformVisit,
        subjectTypeId: 1,
        programId: 10,
        programEncounterTypeId: 100,
        encounterTypeId: null,
      });

      const deps = GroupPrivilegesModel.getEncounterTypeDependencies([viewSubject, viewVisit, otherProgEncounter, target], target);

      expect(uuids(deps)).toEqual(uuids([viewSubject, viewVisit]));
    });
  });

  describe("getChecklistDependencies", () => {
    it("returns matching ViewChecklist and ViewSubject", () => {
      const viewSubject = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
        subjectTypeId: 1,
      });
      const viewChecklist = privilege({
        privilegeTypeName: PrivilegeType.ViewChecklist,
        subjectTypeId: 1,
        checklistDetailId: 50,
      });
      const wrongChecklist = privilege({
        privilegeTypeName: PrivilegeType.ViewChecklist,
        subjectTypeId: 1,
        checklistDetailId: 51,
      });
      const target = privilege({
        privilegeTypeName: PrivilegeType.EditChecklist,
        subjectTypeId: 1,
        checklistDetailId: 50,
      });

      const deps = GroupPrivilegesModel.getChecklistDependencies([viewSubject, viewChecklist, wrongChecklist, target], target);

      expect(uuids(deps)).toEqual(uuids([viewSubject, viewChecklist]));
    });
  });

  describe("collectTransitive", () => {
    // shape of dependency map produced by generatePrivilegeDependenciesAndCheckedState:
    // Map<uuid, { dependencies: uuid[], dependents?: uuid[] }>
    const buildMap = (entries) => new Map(entries);

    it("returns empty array for a node with no edges", () => {
      const map = buildMap([["a", { dependencies: [], dependents: [] }]]);
      expect(GroupPrivilegesModel.collectTransitive(map, "a", "dependents")).toEqual([]);
      expect(GroupPrivilegesModel.collectTransitive(map, "a", "dependencies")).toEqual([]);
    });

    it("does not include the start node itself", () => {
      const map = buildMap([
        ["a", { dependencies: [], dependents: ["b"] }],
        ["b", { dependencies: ["a"], dependents: [] }],
      ]);
      const result = GroupPrivilegesModel.collectTransitive(map, "a", "dependents");
      expect(result).not.toContain("a");
      expect(result).toEqual(["b"]);
    });

    it("walks dependents transitively across multiple levels", () => {
      // ViewSubject -> ViewVisit -> ScheduleVisit -> (nothing)
      const map = buildMap([
        ["viewSubject", { dependencies: [], dependents: ["viewVisit"] }],
        ["viewVisit", { dependencies: ["viewSubject"], dependents: ["scheduleVisit"] }],
        ["scheduleVisit", { dependencies: ["viewVisit"], dependents: [] }],
      ]);
      const result = GroupPrivilegesModel.collectTransitive(map, "viewSubject", "dependents");
      expect(result.sort()).toEqual(["scheduleVisit", "viewVisit"]);
    });

    it("walks dependencies transitively across multiple levels", () => {
      // EditVisit needs ViewVisit needs ViewEnrolmentDetails needs ViewSubject
      const map = buildMap([
        ["viewSubject", { dependencies: [], dependents: ["viewEnrolment"] }],
        ["viewEnrolment", { dependencies: ["viewSubject"], dependents: ["viewVisit"] }],
        ["viewVisit", { dependencies: ["viewEnrolment"], dependents: ["editVisit"] }],
        ["editVisit", { dependencies: ["viewVisit"], dependents: [] }],
      ]);
      const result = GroupPrivilegesModel.collectTransitive(map, "editVisit", "dependencies");
      expect(result.sort()).toEqual(["viewEnrolment", "viewSubject", "viewVisit"]);
    });

    it("handles branching dependent fan-out", () => {
      // ViewSubject -> [ViewVisit, ViewEnrolment, RegisterSubject]
      // ViewVisit -> [ScheduleVisit, PerformVisit]
      // ViewEnrolment -> [EnrolSubject]
      const map = buildMap([
        [
          "viewSubject",
          {
            dependencies: [],
            dependents: ["viewVisit", "viewEnrolment", "registerSubject"],
          },
        ],
        [
          "viewVisit",
          {
            dependencies: ["viewSubject"],
            dependents: ["scheduleVisit", "performVisit"],
          },
        ],
        [
          "viewEnrolment",
          {
            dependencies: ["viewSubject"],
            dependents: ["enrolSubject"],
          },
        ],
        ["registerSubject", { dependencies: ["viewSubject"], dependents: [] }],
        ["scheduleVisit", { dependencies: ["viewVisit"], dependents: [] }],
        ["performVisit", { dependencies: ["viewVisit"], dependents: [] }],
        ["enrolSubject", { dependencies: ["viewEnrolment"], dependents: [] }],
      ]);
      const result = GroupPrivilegesModel.collectTransitive(map, "viewSubject", "dependents");
      expect(result.sort()).toEqual(["enrolSubject", "performVisit", "registerSubject", "scheduleVisit", "viewEnrolment", "viewVisit"]);
    });

    it("terminates on cycles without duplicating visits", () => {
      const map = buildMap([
        ["a", { dependencies: [], dependents: ["b"] }],
        ["b", { dependencies: ["a"], dependents: ["c"] }],
        ["c", { dependencies: ["b"], dependents: ["a"] }], // cycle back to a
      ]);
      const result = GroupPrivilegesModel.collectTransitive(map, "a", "dependents");
      expect(result.sort()).toEqual(["b", "c"]);
    });

    it("handles missing edges field gracefully", () => {
      // a leaf node may not have a `dependents` key at all (per generatePrivilegeDependenciesAndCheckedState)
      const map = buildMap([
        ["a", { dependencies: [], dependents: ["b"] }],
        ["b", { dependencies: ["a"] }], // no dependents key
      ]);
      const result = GroupPrivilegesModel.collectTransitive(map, "a", "dependents");
      expect(result).toEqual(["b"]);
    });
  });

  describe("getEditUserGroupDependencies", () => {
    it("returns all EditUserConfiguration privileges", () => {
      const editUserConfig = privilege({
        privilegeTypeName: PrivilegeType.EditUserConfiguration,
      });
      const other = privilege({
        privilegeTypeName: PrivilegeType.ViewSubject,
      });

      const deps = GroupPrivilegesModel.getEditUserGroupDependencies([editUserConfig, other]);

      expect(uuids(deps)).toEqual([editUserConfig.uuid]);
    });
  });
});
