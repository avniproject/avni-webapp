import { find, get } from "lodash";

const EMPTY_VALUES = Object.freeze([]);

export const findSubjectTypeSyncSettings = (userInfo, subjectType) => {
  if (!userInfo || !subjectType) return null;
  return (
    find(get(userInfo, "syncSettings.subjectTypeSyncSettings", []), ({ subjectTypeUUID }) => subjectTypeUUID === subjectType.uuid) || null
  );
};

export const getAllowedSyncValuesForConcept = (subjectType, subjectTypeSyncSettings, concept) => {
  if (!subjectType || !concept || !concept.uuid) return null;

  const isSync1 = subjectType.syncRegistrationConcept1Usable !== false && concept.uuid === subjectType.syncRegistrationConcept1;
  const isSync2 = subjectType.syncRegistrationConcept2Usable !== false && concept.uuid === subjectType.syncRegistrationConcept2;

  if (!isSync1 && !isSync2) return null;

  if (!subjectTypeSyncSettings) return EMPTY_VALUES;

  const values = isSync1 ? subjectTypeSyncSettings.syncConcept1Values : subjectTypeSyncSettings.syncConcept2Values;
  return values || EMPTY_VALUES;
};
