import { findSubjectTypeSyncSettings, getAllowedSyncValuesForConcept } from "./UserSyncSettingsUtil";
import { assert } from "chai";

const subjectType = {
  uuid: "st-uuid",
  syncRegistrationConcept1: "concept-1-uuid",
  syncRegistrationConcept2: "concept-2-uuid",
};
const conceptOne = { uuid: "concept-1-uuid" };
const conceptTwo = { uuid: "concept-2-uuid" };
const otherConcept = { uuid: "other-concept-uuid" };

const userInfoWith = (subjectTypeSyncSettings) => ({
  syncSettings: { subjectTypeSyncSettings },
});

it("findSubjectTypeSyncSettings returns null when userInfo is undefined", () => {
  assert.isNull(findSubjectTypeSyncSettings(undefined, subjectType));
});

it("findSubjectTypeSyncSettings returns null when no entry matches the subject type", () => {
  const userInfo = userInfoWith([{ subjectTypeUUID: "different-st-uuid", syncConcept1Values: ["X"] }]);
  assert.isNull(findSubjectTypeSyncSettings(userInfo, subjectType));
});

it("findSubjectTypeSyncSettings returns the matching entry", () => {
  const entry = {
    subjectTypeUUID: "st-uuid",
    syncConcept1Values: ["X"],
    syncConcept2Values: [],
  };
  const userInfo = userInfoWith([entry]);
  assert.deepEqual(findSubjectTypeSyncSettings(userInfo, subjectType), entry);
});

it("getAllowedSyncValuesForConcept returns null when subjectType is null", () => {
  assert.isNull(getAllowedSyncValuesForConcept(null, null, conceptOne));
});

it("getAllowedSyncValuesForConcept returns null when concept is not a sync attribute on the subject type", () => {
  const entry = { subjectTypeUUID: "st-uuid", syncConcept1Values: ["X"] };
  assert.isNull(getAllowedSyncValuesForConcept(subjectType, entry, otherConcept));
});

it("getAllowedSyncValuesForConcept returns syncConcept1Values when concept matches subjectType.syncRegistrationConcept1", () => {
  const entry = {
    subjectTypeUUID: "st-uuid",
    syncConcept1Values: ["X", "Y"],
    syncConcept2Values: ["42"],
  };
  assert.deepEqual(getAllowedSyncValuesForConcept(subjectType, entry, conceptOne), ["X", "Y"]);
});

it("getAllowedSyncValuesForConcept returns syncConcept2Values when concept matches subjectType.syncRegistrationConcept2", () => {
  const entry = {
    subjectTypeUUID: "st-uuid",
    syncConcept1Values: ["X"],
    syncConcept2Values: ["42", "43"],
  };
  assert.deepEqual(getAllowedSyncValuesForConcept(subjectType, entry, conceptTwo), ["42", "43"]);
});

it("getAllowedSyncValuesForConcept returns [] (frozen) when entry is missing for a sync attribute concept", () => {
  const result = getAllowedSyncValuesForConcept(subjectType, null, conceptOne);
  assert.deepEqual(result, []);
  assert.isTrue(Object.isFrozen(result));
});

it("getAllowedSyncValuesForConcept returns [] when entry's values array is missing", () => {
  const entry = { subjectTypeUUID: "st-uuid" };
  assert.deepEqual(getAllowedSyncValuesForConcept(subjectType, entry, conceptOne), []);
});

it("getAllowedSyncValuesForConcept returns null when usable flag is explicitly false", () => {
  const st = { ...subjectType, syncRegistrationConcept1Usable: false };
  const entry = { subjectTypeUUID: "st-uuid", syncConcept1Values: ["X"] };
  assert.isNull(getAllowedSyncValuesForConcept(st, entry, conceptOne));
});

it("getAllowedSyncValuesForConcept treats undefined usable flag as enabled", () => {
  const entry = { subjectTypeUUID: "st-uuid", syncConcept1Values: ["X"] };
  assert.deepEqual(getAllowedSyncValuesForConcept(subjectType, entry, conceptOne), ["X"]);
});
