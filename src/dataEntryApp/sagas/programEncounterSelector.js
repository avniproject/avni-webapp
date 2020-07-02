import { find, get, isNil, filter } from "lodash";

export const selectFormMappingForSubjectType = (subjectTypeUuid, programUuid) => state => {
  return filter(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      !isNil(fm.programUUID) &&
      (fm.subjectTypeUUID === subjectTypeUuid &&
        fm.programUUID === programUuid &&
        fm.formType === "ProgramEncounter")
  );
};

export const selectFormMappingByEncounterTypeUuid = encounterTypeUuid => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      !isNil(encounterTypeUuid) &&
      (fm.encounterTypeUUID === encounterTypeUuid && fm.formType === "ProgramEncounter")
  );

export const selectCancelProgramEncounterFormMapping = (
  encounterTypeUuid,
  programUuid,
  subjectTypeUuid
) => state => {
  return find(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      !isNil(encounterTypeUuid) &&
      (fm.encounterTypeUUID === encounterTypeUuid &&
        fm.programUUID === programUuid &&
        fm.subjectTypeUUID === subjectTypeUuid &&
        fm.formType === "ProgramEncounterCancellation")
  );
};
