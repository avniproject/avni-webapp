import { findSubjectTypeSyncSettings, getAllowedSyncValuesForConcept } from "./UserSyncSettingsUtil";
import { assert } from "chai";

const subjectType = { uuid: "st-uuid" };
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
  const userInfo = userInfoWith([{ subjectTypeUUID: "different-st-uuid", syncConcept1: "concept-1-uuid", syncConcept1Values: ["X"] }]);
  assert.isNull(findSubjectTypeSyncSettings(userInfo, subjectType));
});

it("findSubjectTypeSyncSettings returns the matching entry", () => {
  const entry = {
    subjectTypeUUID: "st-uuid",
    syncConcept1: "concept-1-uuid",
    syncConcept1Values: ["X"],
    syncConcept2: null,
    syncConcept2Values: [],
  };
  const userInfo = userInfoWith([entry]);
  assert.deepEqual(findSubjectTypeSyncSettings(userInfo, subjectType), entry);
});

it("getAllowedSyncValuesForConcept returns null when entry is null", () => {
  assert.isNull(getAllowedSyncValuesForConcept(null, conceptOne));
});

it("getAllowedSyncValuesForConcept returns null when concept is not a sync attribute", () => {
  const entry = {
    subjectTypeUUID: "st-uuid",
    syncConcept1: "concept-1-uuid",
    syncConcept1Values: ["X"],
  };
  assert.isNull(getAllowedSyncValuesForConcept(entry, otherConcept));
});

it("getAllowedSyncValuesForConcept returns syncConcept1Values when concept matches entry.syncConcept1", () => {
  const entry = {
    subjectTypeUUID: "st-uuid",
    syncConcept1: "concept-1-uuid",
    syncConcept1Values: ["X", "Y"],
    syncConcept2: "concept-2-uuid",
    syncConcept2Values: ["42"],
  };
  assert.deepEqual(getAllowedSyncValuesForConcept(entry, conceptOne), ["X", "Y"]);
});

it("getAllowedSyncValuesForConcept returns syncConcept2Values when concept matches entry.syncConcept2", () => {
  const entry = {
    subjectTypeUUID: "st-uuid",
    syncConcept1: "concept-1-uuid",
    syncConcept1Values: ["X"],
    syncConcept2: "concept-2-uuid",
    syncConcept2Values: ["42", "43"],
  };
  assert.deepEqual(getAllowedSyncValuesForConcept(entry, conceptTwo), ["42", "43"]);
});

it("getAllowedSyncValuesForConcept returns null when concept matches a null syncConcept2", () => {
  const entry = {
    subjectTypeUUID: "st-uuid",
    syncConcept1: "concept-1-uuid",
    syncConcept1Values: ["X"],
    syncConcept2: null,
    syncConcept2Values: [],
  };
  assert.isNull(getAllowedSyncValuesForConcept(entry, { uuid: null }));
});

it("getAllowedSyncValuesForConcept returns [] when entry's values array is missing", () => {
  const entry = { subjectTypeUUID: "st-uuid", syncConcept1: "concept-1-uuid" };
  assert.deepEqual(getAllowedSyncValuesForConcept(entry, conceptOne), []);
});
