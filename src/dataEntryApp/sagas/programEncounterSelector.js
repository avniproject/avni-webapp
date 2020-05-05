import { find, get, isNil, filter } from "lodash";

export const selectProgramEncounterSubjectType = subjectTypeName => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.subjectTypes"),
    subjectType => subjectType.name === subjectTypeName
  );

export const selectProgramEncounterFormMapping = (subjectType, programUuid) => state =>
  filter(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      !isNil(fm.programUUID) &&
      (fm.subjectTypeUUID === subjectType.uuid &&
        fm.programUUID === programUuid &&
        fm.formType === "ProgramEncounter")
  );

export const selectProgramEncounterFormMappingForSubjectType = (
  subjectTypeName,
  programUuid
) => state => {
  return selectProgramEncounterFormMapping(
    selectProgramEncounterSubjectType(subjectTypeName)(state),
    programUuid
  )(state);
};
