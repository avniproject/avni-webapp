import { find, get, isNil, filter } from "lodash";

export const selectFormMappingForSubjectType = (subjectTypeUuid, programUuid) => state =>
  filter(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      !isNil(fm.programUUID) &&
      (fm.subjectTypeUUID === subjectTypeUuid &&
        fm.programUUID === programUuid &&
        fm.formType === "ProgramEncounter")
  );

export const selectFormMappingForProgramEncounter = (
  encounterTypeUuid,
  programUuid,
  subjectTypeUuid
) => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      !isNil(encounterTypeUuid) &&
      (fm.encounterTypeUUID === encounterTypeUuid &&
        fm.programUUID === programUuid &&
        fm.subjectTypeUUID === subjectTypeUuid &&
        fm.formType === "ProgramEncounter")
  );

export const selectFormMappingForCancelProgramEncounter = (
  encounterTypeUuid,
  programUuid,
  subjectTypeUuid
) => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      !isNil(encounterTypeUuid) &&
      (fm.encounterTypeUUID === encounterTypeUuid &&
        fm.programUUID === programUuid &&
        fm.subjectTypeUUID === subjectTypeUuid &&
        fm.formType === "ProgramEncounterCancellation")
  );
