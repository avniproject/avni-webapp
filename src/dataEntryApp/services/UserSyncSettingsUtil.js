import { find, get } from "lodash";

const EMPTY_VALUES = Object.freeze([]);

export const findSubjectTypeSyncSettings = (userInfo, subjectType) => {
  if (!userInfo || !subjectType) return null;
  return (
    find(get(userInfo, "syncSettings.subjectTypeSyncSettings", []), ({ subjectTypeUUID }) => subjectTypeUUID === subjectType.uuid) || null
  );
};

export const getAllowedSyncValuesForConcept = (subjectTypeSyncSettings, concept) => {
  if (!subjectTypeSyncSettings || !concept || !concept.uuid) return null;
  if (concept.uuid === subjectTypeSyncSettings.syncConcept1) {
    return subjectTypeSyncSettings.syncConcept1Values || EMPTY_VALUES;
  }
  if (concept.uuid === subjectTypeSyncSettings.syncConcept2) {
    return subjectTypeSyncSettings.syncConcept2Values || EMPTY_VALUES;
  }
  return null;
};
